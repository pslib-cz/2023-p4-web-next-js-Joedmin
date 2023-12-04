import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { postid: string } }) {
	try {
		const device = await prisma.device.findFirst({
			where: {
				product_id: params.postid,
			},
		});

		if (!device) {
			return new NextResponse(
				JSON.stringify({
					message: "Device not found",
				}),
				{
					status: 404,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		return new NextResponse(JSON.stringify(device), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (e) {
		console.log(e);
		return new NextResponse(
			JSON.stringify({
				message: "Internal Server Error",
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	}
}
