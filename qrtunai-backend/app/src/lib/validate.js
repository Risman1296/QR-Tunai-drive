
module.exports = {
  validateForm(data, schema) {
    const errors = [];
    for (const key in schema) {
      if (schema[key].required && (data[key] === undefined || data[key] === null || data[key] === '')) {
        errors.push(`${key} is required`);
      }
      if (schema[key].type && typeof data[key] !== schema[key].type && data[key] !== undefined) {
        errors.push(`${key} must be a ${schema[key].type}`);
      }
    }
    return errors;
  }
};
