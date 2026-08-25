export const fetchAllPages = async (getter, params = {}) => {
  const rows = []
  let page = 1
  let pages = 1
  do {
    const result = await getter({ ...params, page, limit: 100 })
    rows.push(...(result.data || []))
    pages = result.pagination?.pages || 1
    page += 1
  } while (page <= pages)
  return rows
}
