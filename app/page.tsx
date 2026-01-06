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
  const [score, setScore] = useState(0);
  const [quizTermine, setQuizTermine] = useState(false);

  const [reponseCliquee, setReponseCliquee] = useState<number | null>(null);


  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from("question")
        .select(`
          id,
          texte,
          image,
          explication,
          reponse (
            id,
            texte,
            reponse_correct
          )
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

  
  function handleClick(reponse: Reponse) {
    if (!question || afficherExplication) return;

    setReponseCliquee(reponse.id);

    if (reponse.reponse_correct) {
      setScore((prev) => prev + 1);
    }

    const message = reponse.reponse_correct
      ? "✅ Bonne réponse !"
      : "❌ Mauvaise réponse.";

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
    }
  }

  return (
    <div>
      
      {!joueurPret && (
        <FormulaireJoueur onJoueurCree={() => setJoueurPret(true)} />
      )}

   
      {question && joueurPret && !quizTermine && (
        <div>
          <Score actuel={score} total={questions.length} />

         
          <div className="max-w-5xl mx-auto mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>
                Question {questionIndex + 1} / {questions.length}
              </span>
              <span>{progression}%</span>
            </div>

            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
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
                      if (reponse.reponse_correct) {
                        className += " bg-green-500 text-white";
                      } else if (reponseCliquee === reponse.id) {
                        className += " bg-red-400 text-white";
                      }
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

                      <Button
                        onClick={questionSuivante}
                        className="mt-6 w-full"
                      >
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
        <div className="mt-20 text-center">
          <Classement />
        </div>
      )}
    </div>
  );
}
