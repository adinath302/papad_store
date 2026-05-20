import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { image } = body;

    if (!image) {
      return Response.json(
        { error: "Image missing" },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.upload(
      image,
      {
        folder: "papad_store",
      }
    );

    return Response.json({
      image: result.secure_url,
    });

  } catch (error: any) {
    console.log(error);

    return Response.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}