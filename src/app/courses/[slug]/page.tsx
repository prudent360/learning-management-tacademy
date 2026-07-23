import { notFound } from "next/navigation";
import { getCourse, getCourses } from "@/lib/courses-server";
import { CoursePlayer } from "@/components/CoursePlayer";
import { CourseCheckout } from "@/components/CourseCheckout";
import { CourseDetailsView } from "@/components/CourseDetailsView";
import { PaymentConfirming } from "@/components/PaymentConfirming";
import { checkEnrollment } from "@/app/actions/enrollment";
import { getPaymentConfig, getPublicBrandingSettings, getStudentCurrencyContext } from "@/app/actions/settings";
import { getMyMembershipDiscount } from "@/app/actions/memberships";
import { getOptionalSession } from "@/lib/dal";

export async function generateStaticParams() {
  try {
    const allCourses = await getCourses();
    return allCourses.map((c) => ({ slug: c.slug }));
  } catch (error) {
    console.warn("Skipping generateStaticParams due to database connection error during build:", error);
    return [];
  }
}

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reference?: string; learn?: string; checkout?: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  const { reference, learn, checkout } = await searchParams;
  const referenceVal = Array.isArray(reference) ? reference[0] : reference;

  const session = await getOptionalSession();
  const { enrolled } = session ? await checkEnrollment(slug) : { enrolled: false };

  // Explicit classroom player request by enrolled user
  if (learn === "true" && (enrolled || course.price <= 0)) {
    return <CoursePlayer course={course} />;
  }

  // Payment confirmation state from gateway redirect
  if (referenceVal) {
    return <PaymentConfirming courseSlug={slug} reference={referenceVal} />;
  }

  // Explicit checkout mode for paid courses
  if (checkout === "true" && !enrolled && course.price > 0 && session) {
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

  // Default view: Public Course Details Page (hero with opacity background, cohort schedule, chapter toggle accordions, register button)
  const [paymentConfig, branding] = await Promise.all([
    getPaymentConfig(),
    getPublicBrandingSettings(),
  ]);

  return (
    <CourseDetailsView
      course={course}
      currency={paymentConfig.currency}
      headerLogo={branding.headerLogo}
      siteName={branding.siteName || "TekSkillUp"}
      isEnrolled={enrolled}
    />
  );
}
