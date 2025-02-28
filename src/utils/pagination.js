// utils/pagination.js
const getPagination = (page, size) => {
    const limit = size ? parseInt(size) : 10;
    const offset = page ? (parseInt(page) - 1) * limit : 0;
    return { limit, offset };
  };
  
  const getPaginatedResponse = (items, totalItems, page, limit) => {
    const currentPage = page ? parseInt(page) : 1;
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      items,
      totalItems,
      currentPage,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
      itemsPerPage: limit
    };
  };
  
  module.exports = {
    getPagination,
    getPaginatedResponse
  };