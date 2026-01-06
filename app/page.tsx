"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ShieldCheck } from "lucide-react"; // Importation d'une icône de sécurité pro

import FormulaireJoueur from "@/components/ui/FormulaireJoueur";
import Score from "@/components/ui/Score";
import Classement from "@/components/ui/Classement";

type Reponse = {
  id: number;
  texte: string;
  reponse_correct: boolean;
};

type Question = {
  id: number;
  texte: string;
  image: string | null;
  explication: string | null;
  reponse: Reponse[];
};

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [afficherExplication, setAfficherExplication] = useState(false);
  const [explication, setExplication] = useState("");
  const [joueurPret, setJoueurPret] = useState(false);
  const [pseudo, setPseudo] = useState(""); 
  const [score, setScore] = useState(0);
  const [quizTermine, setQuizTermine] = useState(false);
  const [reponseCliquee, setReponseCliquee] = useState<number | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from("question")
        .select(`
          id, texte, image, explication, 
          reponse ( id, texte, reponse_correct )
        `)
        .order("id");

      if (error) {
        console.error("Erreur Supabase :", error);
        return;
      }
      setQuestions(data || []);
    }
    fetchQuestions();
  }, []);

  const question = questions[questionIndex];
  const progression = questions.length
    ? Math.round((questionIndex / questions.length) * 100)
    : 0;

  async function enregistrerScoreFinal(scoreFinal: number) {
    if (!pseudo) return;
    const { error } = await supabase
      .from("classement")
      .insert([{ pseudo: pseudo, score: scoreFinal }]);

    if (error) {
      console.error("Erreur lors de l'enregistrement du score:", error.message);
    }
  }

  function handleClick(reponse: Reponse) {
    if (!question || afficherExplication) return;
    setReponseCliquee(reponse.id);
    if (reponse.reponse_correct) {
      setScore((prev) => prev + 1);
    }
    const message = reponse.reponse_correct ? "✅ Bonne réponse !" : "❌ Mauvaise réponse.";
    setExplication(message + " " + (question.explication || ""));
    setAfficherExplication(true);
  }

  function questionSuivante() {
    setAfficherExplication(false);
    setExplication("");
    setReponseCliquee(null);

    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      setQuizTermine(true);
      setScore((currentScore) => {
        enregistrerScoreFinal(currentScore);
        return currentScore;
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* 1. ÉCRAN D'ACCUEIL (AVEC NOUVEAU LOGO) */}
      {!joueurPret && (
        <div className="w-full max-w-[420px] animate-in fade-in zoom-in duration-500">
          
          {/* LOGO MODIFIÉ : Bouclier de sécurité */}
          <div className="flex justify-center mb-[-32px] relative z-10">
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 rotate-0">
              <ShieldCheck className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[32px] overflow-hidden bg-white pt-12 pb-6 px-2">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-800">
                Cyber Quiz
              </CardTitle>
              <p className="text-slate-500 font-medium">
                Identifie les menaces et protège tes données
              </p>
            </CardHeader>
            <CardContent>
              <div className="mt-2 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <FormulaireJoueur onJoueurCree={(p) => { 
                  setPseudo(p); 
                  setJoueurPret(true); 
                }} />
              </div>
              <p className="text-center mt-6 text-[10px] text-slate-300 uppercase tracking-[0.2em] font-bold">
                Sécurité Informatique • 2026
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. ÉCRAN DU QUIZ (RESTE INCHANGÉ) */}
      {question && joueurPret && !quizTermine && (
        <div className="w-full max-w-5xl animate-in fade-in duration-700">
          <Score actuel={score} total={questions.length} />
          <div className="max-w-5xl mx-auto mt-4">
            <div className="flex justify-between text-sm mb-1 text-slate-500">
              <span>Question {questionIndex + 1} / {questions.length}</span>
              <span>{progression}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progression}%` }} />
            </div>
          </div>

          <Card className="max-w-5xl mx-auto mt-8 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <Image
                  src={question.image || "/image/Photo-Malware.png"}
                  alt="Illustration"
                  width={500}
                  height={400}
                  className="rounded-xl w-full object-cover shadow-sm"
                />
              </div>
              <div className="md:w-1/2">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl text-slate-800">Question</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <p className="mb-6 font-semibold text-slate-700 text-lg leading-relaxed">
                    {question.texte}
                  </p>
                  <div className="space-y-3">
                    {question.reponse.map((reponse) => {
                      let btnClass = "w-full justify-start py-6 px-4 text-base transition-all font-medium";
                      if (afficherExplication) {
                        if (reponse.reponse_correct) btnClass += " bg-green-500 text-white hover:bg-green-500 border-green-500";
                        else if (reponseCliquee === reponse.id) btnClass += " bg-red-400 text-white hover:bg-red-400 border-red-400";
                      }
                      return (
                        <Button
                          key={reponse.id}
                          onClick={() => handleClick(reponse)}
                          disabled={afficherExplication}
                          variant="outline"
                          className={btnClass}
                        >
                          {reponse.texte}
                        </Button>
                      );
                    })}
                  </div>
                  {afficherExplication && (
                    <div className="mt-8 animate-in slide-in-from-top-2 duration-300">
                      <Alert className="bg-blue-50 border-blue-100">
                        <AlertTitle className="text-blue-800 font-bold italic">💡 Le savais-tu ?</AlertTitle>
                        <AlertDescription className="text-blue-700">{explication}</AlertDescription>
                      </Alert>
                      <Button onClick={questionSuivante} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold">
                        Continuer →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 3. ÉCRAN DE CLASSEMENT */}
      {quizTermine && (
        <div className="w-full max-w-4xl animate-in slide-in-from-bottom-8 duration-700">
          <Classement />
        </div>
      )}
    </div>
  );
}