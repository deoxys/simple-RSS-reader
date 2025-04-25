export function GET() {
    return Response.json(
        { status: "success", message: "Service is up and running!" }
    )
}
