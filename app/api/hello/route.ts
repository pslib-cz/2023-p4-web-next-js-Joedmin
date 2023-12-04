export async function GET(req: Request, res: Response) {
  return new Response(JSON.stringify({
    message: "Hello",
  }),
  {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}