"use client";

import { useState } from "react";
import { Modality, PublicSlot, Booking } from "@/lib/types";
import ModalityPicker from "./ModalityPicker";
import SlotPicker from "./SlotPicker";
import BookingForm from "./BookingForm";
import SuccessCard from "./SuccessCard";

type Step = "modality" | "slot" | "form" | "done";

export default function BookingFlow() {
  const [step, setStep] = useState<Step>("modality");
  const [modality, setModality] = useState<Modality | null>(null);
  const [slot, setSlot] = useState<PublicSlot | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  function reset() {
    setStep("modality");
    setModality(null);
    setSlot(null);
    setBooking(null);
  }

  return (
    <div>
      {step !== "modality" && step !== "done" && (
        <button
          onClick={() => {
            if (step === "form") setStep("slot");
            else if (step === "slot") setStep("modality");
          }}
          className="mb-4 text-sm font-semibold text-clay underline-offset-4 hover:underline"
        >
          ← Volver
        </button>
      )}

      {step === "modality" && (
        <div className="animate-fade-up">
          <ModalityPicker
            onPick={(m) => {
              setModality(m);
              setStep("slot");
            }}
          />
        </div>
      )}

      {step === "slot" && modality && (
        <div className="animate-fade-up">
          <SlotPicker
            modality={modality}
            onPick={(s) => {
              setSlot(s);
              setStep("form");
            }}
          />
        </div>
      )}

      {step === "form" && slot && (
        <div className="animate-fade-up">
          <BookingForm
            slot={slot}
            onBooked={(b) => {
              setBooking(b);
              setStep("done");
            }}
          />
        </div>
      )}

      {step === "done" && booking && (
        <div className="animate-fade-up">
          <SuccessCard booking={booking} onReset={reset} />
        </div>
      )}
    </div>
  );
}
