"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import FormulaireJoueur from "@/components/ui/FormulaireJoueur";
import Score from "@/components/ui/Score";
import Classement from "@/components/ui/Classement";

// ... (Garde tes types Question et Reponse inchangés)

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [afficherExplication, setAfficherExplication] = useState(false);
  const [explication, setExplication] = useState("");
  const [joueurPret, setJoueurPret] = useState(false);
  const [score, setScore] = useState(0);
  const [quizTermine, setQuizTermine] = useState(false);
  const [reponseCliquee, setReponseCliquee] = useState<number | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from("question")
        .select(`id, texte, image, explication, reponse ( id, texte, reponse_correct )`)
        .order("id");
      if (error) console.error("Erreur Supabase :", error);
      else setQuestions(data || []);
    }
    fetchQuestions();
  }, []);

  const question = questions[questionIndex];
  const progression = questions.length ? Math.round((questionIndex / questions.length) * 100) : 0;

  // Tes fonctions de logique (handleClick, questionSuivante) restent strictement les mêmes
  function handleClick(reponse: Reponse) {
    if (!question || afficherExplication) return;
    setReponseCliquee(reponse.id);
    if (reponse.reponse_correct) setScore((prev) => prev + 1);
    const message = reponse.reponse_correct ? "✅ Bonne réponse !" : "❌ Mauvaise réponse.";
    setExplication(message + " " + (question.explication || ""));
    setAfficherExplication(true);
  }

  function questionSuivante() {
    setAfficherExplication(false);
    setExplication("");
    setReponseCliquee(null);
    if (questionIndex + 1 < questions.length) setQuestionIndex((prev) => prev + 1);
    else setQuizTermine(true);
  }

  return (
    // On ajoute un fond plus sympa pour toute la page
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      
      {/* --- SECTION LOGIN (MODIFIÉE) --- */}
      {!joueurPret && (
        <div className="w-full max-w-[450px] animate-in fade-in zoom-in duration-500">
            {/* Petit badge décoratif au dessus de la carte */}
            <div className="flex justify-center mb-6">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-200 rotate-3">
                    <span className="text-3xl">📝</span>
                </div>
            </div>

            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden">
                <CardHeader className="space-y-1 pt-8">
                    <CardTitle className="text-3xl font-bold text-center text-slate-800">
                        Bienvenue !
                    </CardTitle>
                    <p className="text-center text-slate-500 font-medium">
                        Prêt à tester tes connaissances ?
                    </p>
                </CardHeader>
                <CardContent className="pb-8 px-8">
                    {/* Ton composant FormulaireJoueur est rendu ici */}
                    <div className="mt-4">
                        <FormulaireJoueur onJoueurCree={() => setJoueurPret(true)} />
                    </div>
                </CardContent>
            </Card>
            
            {/* Petit texte de rassurance en bas */}
            <p className="text-center mt-8 text-slate-400 text-sm">
                Rejoins les autres joueurs au classement final !
            </p>
        </div>
      )}

      {/* --- SECTION QUIZ (INCHANGÉE selon ton souhait) --- */}
      {question && joueurPret && !quizTermine && (
        <div className="w-full">
          <Score actuel={score} total={questions.length} />

          <div className="max-w-5xl mx-auto mt-4">
            <div className="flex justify-between text-sm mb-1 text-slate-600">
              <span>Question {questionIndex + 1} / {questions.length}</span>
              <span>{progression}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progression}%` }}
              />
            </div>
          </div>

          <Card className="max-w-5xl mx-auto mt-8 p-6">
            <div className="flex gap-6">
              <div className="w-1/2">
                <Image
                  src={question.image || "/image/Photo-Malware.png"}
                  alt="Illustration"
                  width={500}
                  height={400}
                  className="rounded w-full"
                />
              </div>

              <div className="w-1/2">
                <CardHeader>
                  <CardTitle>Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 font-medium">{question.texte}</p>
                  {question.reponse.map((reponse) => {
                    let className = "w-full justify-start mt-2";
                    if (afficherExplication) {
                      if (reponse.reponse_correct) className += " bg-green-500 text-white hover:bg-green-500";
                      else if (reponseCliquee === reponse.id) className += " bg-red-400 text-white hover:bg-red-400";
                    }
                    return (
                      <Button
                        key={reponse.id}
                        onClick={() => handleClick(reponse)}
                        disabled={afficherExplication}
                        variant="outline"
                        className={className}
                      >
                        {reponse.texte}
                      </Button>
                    );
                  })}

                  {afficherExplication && (
                    <>
                      <Alert className="mt-6">
                        <AlertTitle>Explication</AlertTitle>
                        <AlertDescription>{explication}</AlertDescription>
                      </Alert>
                      <Button onClick={questionSuivante} className="mt-6 w-full bg-blue-600">
                        Question suivante →
                      </Button>
                    </>
                  )}
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      )}

      {quizTermine && (
        <div className="mt-20 text-center w-full">
          <Classement />
        </div>
      )}
    </div>
  );
}