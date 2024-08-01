export default function createSuccessResponse(config: { data: null | object }) {
  return {
    status: 'success',
    data: config.data,
  } as const;
}
