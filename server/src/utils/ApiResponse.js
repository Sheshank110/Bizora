/**
 * Standardized API response format helper.
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
  }

  static success(res, data, message = 'Success', statusCode = 200, extra = {}) {
    let code = typeof statusCode === 'number' ? statusCode : 200;
    let extraData = typeof statusCode === 'object' && statusCode !== null ? statusCode : (extra || {});

    return res.status(code).json({
      success: true,
      message,
      data,
      ...extraData,
    });
  }

  static created(res, data, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

export default ApiResponse;
