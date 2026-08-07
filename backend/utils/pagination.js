const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getPagination = (query, options = {}) => {
  const maxLimit = options.maxLimit || MAX_LIMIT;
  const limit = Math.min(parsePositiveInt(query.limit, options.defaultLimit || DEFAULT_LIMIT), maxLimit);
  const page = parsePositiveInt(query.page, 1);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const paginatedResponse = ({ items, totalItems, page, limit }) => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    data: items,
    currentPage: page,
    totalPages,
    totalItems,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
};

module.exports = { getPagination, paginatedResponse };
