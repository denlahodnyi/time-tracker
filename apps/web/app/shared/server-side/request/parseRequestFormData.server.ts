export default async function parseRequestFormData(request: Request) {
  return Object.fromEntries(await request.formData());
}
