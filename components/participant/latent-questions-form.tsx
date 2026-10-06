"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const LATENT_QUESTIONS = [
  "If you woke up with a superpower for one day, what would it be?",
  "If you could have any nickname without worrying about being judged or teased, what would it be?",
  "What is the weirdest encounter you have ever had with a stranger?",
  "What is the weirdest character you would choose to replace yourself with for a day?",
  "What is the funniest story from your childhood or your most recent funny experience?",
  "Tell us an interesting or unusual fact about yourself.",
  "What is the best aspect of your personality that you admire the most?",
  "Describe your \"latent\" - the hidden talent, trait, or weirdness that people don't usually notice about you.",
  "Why do you think you should be selected for VVIT Got Latent?",
];

export default function LatentQuestionsForm({
  registrationId,
  eventName,
  initialAnswers,
}: {
  registrationId: string;
  eventName: string;
  initialAnswers: Record<string, string>;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    LATENT_QUESTIONS.forEach((q, i) => {
      map[q] = initialAnswers[q] ?? initialAnswers[i?.toString()] ?? "";
    });
    return map;
  });
  const [saving, setSaving] = useState(false);

  const complete = LATENT_QUESTIONS.every((q) => (answers[q] ?? "").trim().length > 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/registrations/${registrationId}/latent-answers`, { answers });
      toast.success("VVIT GOT LATENT answers saved", { description: "Your selection responses were updated." });
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || e?.response?.data?.message || "Could not save answers";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">VVIT GOT LATENT &ndash; Selection Questions</CardTitle>
        <CardDescription>For your registration ({eventName}). Please complete all questions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {LATENT_QUESTIONS.map((q, i) => (
          <div key={q} className="space-y-2">
            <label className="text-sm font-medium leading-5 text-[#0F172A] block">
              {i + 1}. {q}
            </label>
            <Textarea
              value={answers[q] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q]: e.target.value }))}
              rows={2}
              placeholder="Your answer"
              className="rounded-xl"
            />
          </div>
        ))}
        <Button onClick={handleSave} disabled={saving || !complete} className="rounded-full bg-[#0F172A] text-white hover:bg-black">
          {saving ? "Saving..." : "Save answers"}
        </Button>
      </CardContent>
    </Card>
  );
}
