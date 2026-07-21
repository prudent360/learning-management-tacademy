import { notFound } from "next/navigation";
import { getCourse, getCourses } from "@/lib/courses-server";
import { CoursePlayer } from "@/components/CoursePlayer";
import { CourseCheckout } from "@/components/CourseCheckout";
import { PaymentConfirming } from "@/components/PaymentConfirming";
import { checkEnrollment } from "@/app/actions/enrollment";
import { getPaymentConfig, getStudentCurrencyContext } from "@/app/actions/settings";
import { getMyMembershipDiscount } from "@/app/actions/memberships";
import { getOptionalSession } from "@/lib/dal";

export async function generateStaticParams() {
  try {
    const allCourses = await getCourses();
    return allCourses.map((c) => ({ slug: c.slug }));
  } catch (error) {
    console.warn("Skipping generateStaticParams due to database connection error/missing credentials during build:", error);
    return [];
  }
}

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reference?: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  const session = await getOptionalSession();

  // Free courses or no active session → show player directly
  if (course.price <= 0 || !session) {
    return <CoursePlayer course={course} />;
  }

  // Check if already enrolled
  const { enrolled } = await checkEnrollment(slug);
  if (enrolled) {
    return <CoursePlayer course={course} />;
  }

  // Just returned from a hosted checkout page — the gateway appends its own
  // "?reference=..." to the bare return URL we gave it, so that param's mere
  // presence is what signals we're back from checkout (see enrollment.ts's
  // initFincraPayment/initPaystackPayment for why we don't add our own
  // query params here). The webhook that actually records enrollment can lag
  // a few seconds behind this redirect, so hold on a confirming state
  // instead of bouncing straight back to checkout.
  const { reference } = await searchParams;
  const referenceVal = Array.isArray(reference) ? reference[0] : reference;

  if (referenceVal) {
    return <PaymentConfirming courseSlug={slug} reference={referenceVal} />;
  }

  // Not enrolled in a paid course → show checkout
  const [paymentConfig, currencyContext, membershipDiscountPct] = await Promise.all([
    getPaymentConfig(),
    getStudentCurrencyContext(),
    getMyMembershipDiscount(),
  ]);
  return (
    <CourseCheckout
      course={course}
      currency={paymentConfig.currency}
      gateways={paymentConfig.gateways}
      displayCurrency={currencyContext.displayCurrency}
      displayRate={currencyContext.rate}
      membershipDiscountPct={membershipDiscountPct}
    />
  );
}
