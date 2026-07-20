"use client";

import React, { useEffect, useRef } from "react";
import { drawCertificate } from "@/lib/certificate";

type VerifyCanvasPreviewProps = {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  dateIssued: Date;
  credentialId: string;
};

export function VerifyCanvasPreview({
  studentName,
  courseTitle,
  instructorName,
  dateIssued,
  credentialId,
}: VerifyCanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dateStr = new Date(dateIssued).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    drawCertificate(ctx, {
      name: studentName,
      course: courseTitle,
      instructor: instructorName,
      date: dateStr,
      credId: credentialId,
    });
  }, [studentName, courseTitle, instructorName, dateStr, credentialId]);

  return (
    <div className="w-full bg-slate-100 p-4 rounded-xl border border-line flex justify-center">
      <canvas
        ref={canvasRef}
        width={1600}
        height={1140}
        className="h-auto w-full max-w-2xl rounded shadow-md bg-white"
      />
    </div>
  );
}
