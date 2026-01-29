import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, Send, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface SetFeedbackFormProps {
  setId: number;
  existingFeedback?: {
    rating: number;
    comment?: string | null;
    workedWell?: string[] | null;
    needsImprovement?: string[] | null;
    usedInLive: boolean;
    venueType?: string | null;
  } | null;
  onSuccess?: () => void;
}

// workedWellOptions moved to component body to access t()

// needsImprovementOptions moved to component body to access t()

// venueTypes moved to component body to access t()

export default function SetFeedbackForm({ setId, existingFeedback, onSuccess }: SetFeedbackFormProps) {
  const { t } = useTranslation();
  
  const workedWellOptions = [
    { value: "transiciones", label: t("feedbackForm.smoothTransitions") },
    { value: "energia", label: t("feedbackForm.energyCurve") },
    { value: "compatibilidad", label: t("feedbackForm.harmonicCompatibility") },
    { value: "flow", label: t("feedbackForm.overallFlow") },
    { value: "timing", label: t("feedbackForm.perfectTiming") },
  ];

  const needsImprovementOptions = [
    { value: "bpm", label: t("feedbackForm.bpmRange") },
    { value: "key", label: t("feedbackForm.keyCompatibility") },
    { value: "orden", label: t("feedbackForm.trackOrder") },
    { value: "duracion", label: t("feedbackForm.setDuration") },
    { value: "variedad", label: t("feedbackForm.styleVariety") },
  ];

  const venueTypes = [
    { value: "club", label: t("feedbackForm.club") },
    { value: "festival", label: t("feedbackForm.festival") },
    { value: "bar", label: t("feedbackForm.bar") },
    { value: "radio", label: t("feedbackForm.radio") },
    { value: "stream", label: t("feedbackForm.stream") },
    { value: "other", label: t("feedbackForm.other") },
  ];
  
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingFeedback?.comment || "");
  const [workedWell, setWorkedWell] = useState<string[]>(existingFeedback?.workedWell || []);
  const [needsImprovement, setNeedsImprovement] = useState<string[]>(existingFeedback?.needsImprovement || []);
  const [usedInLive, setUsedInLive] = useState(existingFeedback?.usedInLive || false);
  const [venueType, setVenueType] = useState<string>(existingFeedback?.venueType || "");

  const utils = trpc.useUtils();

  const submitFeedbackMutation = trpc.setFeedback.submitFeedback.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.setFeedback.getSetFeedback.invalidate({ setId });
      utils.djMode.getMySets.invalidate();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || t("feedbackForm.errorSending"));
    },
  });

  const handleWorkedWellToggle = (value: string) => {
    setWorkedWell(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleNeedsImprovementToggle = (value: string) => {
    setNeedsImprovement(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error(t("feedbackForm.selectRating"));
      return;
    }

    submitFeedbackMutation.mutate({
      setId,
      rating,
      comment: comment || undefined,
      workedWell: workedWell.length > 0 ? workedWell : undefined,
      needsImprovement: needsImprovement.length > 0 ? needsImprovement : undefined,
      usedInLive,
      venueType: venueType ? (venueType as "club" | "festival" | "bar" | "radio" | "stream" | "other") : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Rating con estrellas */}
      <div>
        <Label className="text-white mb-2 block">{t("feedbackForm.overallRating")}</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-600"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-400 mt-1">
            {rating === 5 && t("feedbackForm.excellent")}
            {rating === 4 && t("feedbackForm.veryGood")}
            {rating === 3 && t("feedbackForm.good")}
            {rating === 2 && t("feedbackForm.fair")}
            {rating === 1 && t("feedbackForm.needsImprovement")}
          </p>
        )}
      </div>

      {/* Comentario */}
      <div>
        <Label htmlFor="comment" className="text-white mb-2 block">
          Comentario (opcional)
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("feedbackForm.commentPlaceholder")}
          className="bg-slate-800 border-cyan-500/30 text-white min-h-[100px]"
        />
      </div>

      {/* ¿Qué funcionó bien? */}
      <div>
        <Label className="text-white mb-2 block">{t("feedbackForm.whatWorkedWell")}</Label>
        <div className="grid grid-cols-2 gap-2">
          {workedWellOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`worked-${option.value}`}
                checked={workedWell.includes(option.value)}
                onCheckedChange={() => handleWorkedWellToggle(option.value)}
                className="border-cyan-500 data-[state=checked]:bg-cyan-500"
              />
              <label
                htmlFor={`worked-${option.value}`}
                className="text-sm text-gray-300 cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* ¿Qué mejorar? */}
      <div>
        <Label className="text-white mb-2 block">{t("feedbackForm.whatToImprove")}</Label>
        <div className="grid grid-cols-2 gap-2">
          {needsImprovementOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`improve-${option.value}`}
                checked={needsImprovement.includes(option.value)}
                onCheckedChange={() => handleNeedsImprovementToggle(option.value)}
                className="border-purple-500 data-[state=checked]:bg-purple-500"
              />
              <label
                htmlFor={`improve-${option.value}`}
                className="text-sm text-gray-300 cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* ¿Lo usaste en vivo? */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="usedInLive"
          checked={usedInLive}
          onCheckedChange={(checked) => setUsedInLive(checked as boolean)}
          className="border-green-500 data-[state=checked]:bg-green-500"
        />
        <label htmlFor="usedInLive" className="text-sm text-white cursor-pointer flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          ¿Lo usaste en vivo?
        </label>
      </div>

      {/* Tipo de venue */}
      {usedInLive && (
        <div>
          <Label className="text-white mb-2 block">{t("feedbackForm.whereUsed")}</Label>
          <RadioGroup value={venueType} onValueChange={setVenueType}>
            <div className="grid grid-cols-2 gap-2">
              {venueTypes.map((venue) => (
                <div key={venue.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={venue.value}
                    id={`venue-${venue.value}`}
                    className="border-cyan-500 text-cyan-500"
                  />
                  <label
                    htmlFor={`venue-${venue.value}`}
                    className="text-sm text-gray-300 cursor-pointer"
                  >
                    {venue.label}
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Botón de enviar */}
      <Button
        onClick={handleSubmit}
        disabled={submitFeedbackMutation.isPending || rating === 0}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
      >
        <Send className="w-4 h-4 mr-2" />
        {submitFeedbackMutation.isPending ? t("feedbackForm.sending") : existingFeedback ? t("feedbackForm.updateFeedback") : t("feedbackForm.sendFeedback")}
      </Button>
    </div>
  );
}
