import { notFound } from "next/navigation";
import { getCourse, getCourses } from "@/lib/courses-server";
import { CoursePlayer } from "@/components/CoursePlayer";
import { CourseCheckout } from "@/components/CourseCheckout";
import { PaymentConfirming } from "@/components/PaymentConfirming";
import { checkEnrollment } from "@/app/actions/enrollment";
import { getPaymentConfig } from "@/app/actions/settings";
import { getOptionalSession } from "@/lib/dal";

export async function generateStaticParams() {
  const allCourses = await getCourses();
  return allCourses.map((c) => ({ slug: c.slug }));
}

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ payment?: string; reference?: string }>;
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

  // Just returned from a hosted checkout page — the webhook that actually
  // records enrollment can lag a few seconds behind this redirect, so hold
  // on a confirming state instead of bouncing straight back to checkout.
  const { payment, reference } = await searchParams;
  const paymentVal = Array.isArray(payment) ? payment[0] : payment;
  const referenceVal = Array.isArray(reference) ? reference[0] : reference;

  if (paymentVal === "success" && referenceVal) {
    return <PaymentConfirming courseSlug={slug} reference={referenceVal} />;
  }

  // Not enrolled in a paid course → show checkout
  const paymentConfig = await getPaymentConfig();
  return (
    <CourseCheckout
      course={course}
      currency={paymentConfig.currency}
      gateways={paymentConfig.gateways}
    />
  );
}
