import { redirect } from "next/navigation";
import Stripe from "stripe";
import Link from "next/link";

// Next.js Server Components can read URL search params directly
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  // 1. If someone just types /success in the URL, kick them out
  if (!sessionId) {
    redirect("/");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  try {
    // 2. Ask Stripe to look up the session ID from the URL
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 3. If they haven't actually paid, kick them out
    if (session.payment_status !== "paid") {
      redirect("/");
    }
  } catch (error) {
    // 4. If they typed a fake session ID that Stripe doesn't recognize, kick them out
    console.error("Invalid session ID:", error);
    redirect("/");
  }

  // 5. If they passed all the checks, render the actual Success UI
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0B1120] px-4 text-white">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-4xl font-bold text-green-400">
          Payment Successful!
        </h1>
        <p className="mb-8 text-lg text-gray-300">
          Thank you for your purchase. Your payment has been securely processed. 
          Please check your inbox (and spam folder) for the email containing your flashcard download link.
        </p>
        <Link
          href="/shop"
          className="inline-block rounded-md bg-white px-6 py-3 font-semibold text-[#0B1120] transition-colors hover:bg-gray-200"
        >
          Return to Shop
        </Link>
      </div>
    </main>
  );
}