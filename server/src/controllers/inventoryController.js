import mongoose from 'mongoose';
import InventoryItem, { INVENTORY_STATUS } from '../models/InventoryItem.js';
import InventoryTransaction, { TRANSACTION_TYPE } from '../models/InventoryTransaction.js';
import Supplier from '../models/Supplier.js';
import Notification, { NOTIFICATION_TYPES } from '../models/Notification.js';
import devMockDb from '../services/devMockDb.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const isMongoConnected = () => mongoose.connection.readyState === 1;

/**
 * List inventory items with search, category, status & pagination
 */
export const listInventory = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const { search, category, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  if (isMongoConnected()) {
    const query = { businessId };
    if (category && category !== 'ALL') query.category = category;
    if (status && status !== 'ALL') query.status = status;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [{ name: regex }, { sku: regex }, { category: regex }, { location: regex }];
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const allowedSort = ['createdAt', 'name', 'sku', 'stockQuantity', 'sellingPrice'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

    const [total, items] = await Promise.all([
      InventoryItem.countDocuments(query),
      InventoryItem.find(query)
        .sort({ [safeSort]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate('supplierId', 'name contactName email phone'),
    ]);

    return ApiResponse.success(res, items, 'Inventory items fetched', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } else {
    let list = devMockDb.findInventoryItemsByBusiness(businessId);
    if (category && category !== 'ALL') list = list.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    if (status && status !== 'ALL') list = list.filter((i) => i.status === status);

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          (i.name || '').toLowerCase().includes(term) ||
          (i.sku || '').toLowerCase().includes(term) ||
          (i.category || '').toLowerCase().includes(term)
      );
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (valA < valB) return -1 * sortDirection;
      if (valA > valB) return 1 * sortDirection;
      return 0;
    });

    const total = list.length;
    const paginated = list.slice(skip, skip + limit).map((i) => {
      const sup = i.supplierId ? devMockDb.suppliers.find((s) => s._id === i.supplierId || s.id === i.supplierId) : null;
      return {
        ...i,
        supplierId: sup ? { id: sup._id || sup.id, name: sup.name } : null,
      };
    });

    return ApiResponse.success(res, paginated, 'Inventory items fetched', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  }
});

/**
 * Get item by ID with transactions
 */
export const getInventoryItemById = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { itemId } = req.params;

  if (isMongoConnected()) {
    const item = await InventoryItem.findOne({ _id: itemId, businessId }).populate('supplierId');
    if (!item) throw ApiError.notFound('Inventory item not found');

    const transactions = await InventoryTransaction.find({ businessId, itemId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('createdBy', 'firstName lastName');

    return ApiResponse.success(res, { item, transactions }, 'Inventory item details fetched');
  } else {
    const item = devMockDb.findInventoryItemById(itemId, businessId);
    if (!item) throw ApiError.notFound('Inventory item not found');

    const transactions = devMockDb.findTransactionsByItem(itemId, businessId);
    return ApiResponse.success(res, { item, transactions }, 'Inventory item details fetched');
  }
});

/**
 * Create inventory item
 */
export const createInventoryItem = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { name, sku, category, description, costPrice, sellingPrice, stockQuantity, minimumStock, supplierId, location } = req.body;

  if (!name || !name.trim()) throw ApiError.badRequest('Item name is required');
  if (!sku || !sku.trim()) throw ApiError.badRequest('SKU is required');

  const stock = Number(stockQuantity) || 0;
  const minStock = Number(minimumStock) || 5;

  let status = INVENTORY_STATUS.IN_STOCK;
  if (stock === 0) status = INVENTORY_STATUS.OUT_OF_STOCK;
  else if (stock <= minStock) status = INVENTORY_STATUS.LOW_STOCK;

  if (isMongoConnected()) {
    const existing = await InventoryItem.findOne({ businessId, sku: sku.trim().toUpperCase() });
    if (existing) throw ApiError.conflict('An item with this SKU already exists');

    const item = await InventoryItem.create({
      businessId,
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: category || 'General',
      description: description || '',
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      stockQuantity: stock,
      minimumStock: minStock,
      supplierId: supplierId || null,
      location: location || 'Main Warehouse',
      status,
    });

    if (stock > 0) {
      await InventoryTransaction.create({
        businessId,
        itemId: item._id,
        type: TRANSACTION_TYPE.PURCHASE,
        quantity: stock,
        previousStock: 0,
        newStock: stock,
        reason: 'Initial stock intake',
        createdBy: userId,
      });
    }

    return ApiResponse.created(res, item, 'Inventory item created successfully');
  } else {
    const existing = devMockDb.findInventoryItemsByBusiness(businessId).find((i) => i.sku.toUpperCase() === sku.trim().toUpperCase());
    if (existing) throw ApiError.conflict('An item with this SKU already exists');

    const newItem = {
      _id: `inv_item_${Date.now()}`,
      id: `inv_item_${Date.now()}`,
      businessId,
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: category || 'General',
      description: description || '',
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      stockQuantity: stock,
      minimumStock: minStock,
      supplierId: supplierId || null,
      location: location || 'Main Warehouse',
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    devMockDb.inventoryItems.unshift(newItem);

    if (stock > 0) {
      devMockDb.inventoryTransactions.unshift({
        _id: `tx_${Date.now()}`,
        id: `tx_${Date.now()}`,
        businessId,
        itemId: newItem._id,
        type: TRANSACTION_TYPE.PURCHASE,
        quantity: stock,
        previousStock: 0,
        newStock: stock,
        reason: 'Initial stock intake',
        createdBy: userId,
        createdAt: new Date(),
      });
    }

    return ApiResponse.created(res, newItem, 'Inventory item created successfully');
  }
});

/**
 * Adjust stock quantity (Purchase, Sale, Adjustment, Damage)
 */
export const adjustStock = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const userId = req.user._id || req.user.id;
  const { itemId } = req.params;
  const { type = 'ADJUSTMENT', quantity, reason, reference } = req.body;

  const delta = Number(quantity);
  if (!delta || delta === 0) throw ApiError.badRequest('Valid non-zero quantity is required');

  if (isMongoConnected()) {
    const item = await InventoryItem.findOne({ _id: itemId, businessId });
    if (!item) throw ApiError.notFound('Item not found');

    const previousStock = item.stockQuantity;
    const newStock = Math.max(0, previousStock + delta);

    item.stockQuantity = newStock;
    if (newStock === 0) item.status = INVENTORY_STATUS.OUT_OF_STOCK;
    else if (newStock <= item.minimumStock) item.status = INVENTORY_STATUS.LOW_STOCK;
    else item.status = INVENTORY_STATUS.IN_STOCK;

    await item.save();

    const transaction = await InventoryTransaction.create({
      businessId,
      itemId: item._id,
      type: type.toUpperCase(),
      quantity: delta,
      previousStock,
      newStock,
      reason: reason || 'Manual stock adjustment',
      reference: reference || '',
      createdBy: userId,
    });

    if (item.status === INVENTORY_STATUS.LOW_STOCK || item.status === INVENTORY_STATUS.OUT_OF_STOCK) {
      await Notification.create({
        userId: req.business.ownerId,
        businessId,
        type: NOTIFICATION_TYPES.LOW_STOCK,
        title: `Low Stock: ${item.name}`,
        message: `${item.sku} is at ${newStock} units (threshold: ${item.minimumStock}).`,
        data: { itemId: item._id, sku: item.sku },
      });
    }

    return ApiResponse.success(res, { item, transaction }, 'Stock adjusted successfully');
  } else {
    const item = devMockDb.findInventoryItemById(itemId, businessId);
    if (!item) throw ApiError.notFound('Item not found');

    const previousStock = item.stockQuantity;
    const newStock = Math.max(0, previousStock + delta);

    item.stockQuantity = newStock;
    if (newStock === 0) item.status = INVENTORY_STATUS.OUT_OF_STOCK;
    else if (newStock <= item.minimumStock) item.status = INVENTORY_STATUS.LOW_STOCK;
    else item.status = INVENTORY_STATUS.IN_STOCK;

    const tx = {
      _id: `tx_${Date.now()}`,
      id: `tx_${Date.now()}`,
      businessId,
      itemId: item._id,
      type: type.toUpperCase(),
      quantity: delta,
      previousStock,
      newStock,
      reason: reason || 'Manual stock adjustment',
      reference: reference || '',
      createdBy: userId,
      createdAt: new Date(),
    };

    devMockDb.inventoryTransactions.unshift(tx);

    if (item.status === INVENTORY_STATUS.LOW_STOCK || item.status === INVENTORY_STATUS.OUT_OF_STOCK) {
      devMockDb.notifications.unshift({
        _id: `notif_${Date.now()}`,
        id: `notif_${Date.now()}`,
        userId: req.business.ownerId,
        businessId,
        type: NOTIFICATION_TYPES.LOW_STOCK,
        title: `Low Stock: ${item.name}`,
        message: `${item.sku} is at ${newStock} units (threshold: ${item.minimumStock}).`,
        data: { itemId: item._id, sku: item.sku },
        read: false,
        createdAt: new Date(),
      });
    }

    return ApiResponse.success(res, { item, transaction: tx }, 'Stock adjusted successfully');
  }
});

/**
 * Get transactions audit history for inventory item
 */
export const getItemTransactions = asyncHandler(async (req, res) => {
  const businessId = req.business._id || req.business.id;
  const { itemId } = req.params;

  if (isMongoConnected()) {
    const transactions = await InventoryTransaction.find({ itemId, businessId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName email');
    return ApiResponse.success(res, transactions, 'Transactions fetched');
  } else {
    const list = devMockDb.findTransactionsByItem(itemId, businessId);
    return ApiResponse.success(res, list, 'Transactions fetched');
  }
});

