"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from "next/link";
import FormulaireJoueur from '@/components/ui/FormulaireJoueur';
import Score from '@/components/ui/Score';
import Classement from "@/components/ui/Classement";

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [explication, setExplication] = useState("");
  const [afficherExplication, setAfficherExplication] = useState(false);
  const [joueurPret, setJoueurPret] = useState(false);
  const [joueurNom, setJoueurNom] = useState<string>('Sans nom');
  const [score, setScore] = useState(0);
  const [debut, setDebut] = useState<number | null>(null);
  const [quizTermine, setQuizTermine] = useState(false);
  const [reponseCliquee, setReponseCliquee] = useState<number | null>(null);

  useEffect(() => {
    async function fetchQuestion() {
      const { data } = await supabase
        .from('question')
        .select(`
          id,
          texte,
          image,
          image_credit_nom,
          image_credit_url,
          explication,
          reponse:reponse (
            id,
            texte,
            reponse_correct
          )
        `)
        .order('id');

      setQuestions(data || []);
      setDebut(Date.now());
    }
    fetchQuestion();
  }, []);

  const question = questions[questionIndex];

  // 🔥 BARRE DE PROGRESSION
  const progression = questions.length
    ? Math.round(((questionIndex + 1) / questions.length) * 100)
    : 0;

  function handleClick(reponse: any) {
    if (!question || afficherExplication) return;

    setReponseCliquee(reponse.id);

    if (reponse.reponse_correct) {
      setScore(prev => prev + 1);
    }

    const message = reponse.reponse_correct
      ? "✅ Bonne réponse !"
      : "❌ Mauvaise réponse.";

    setExplication(message + " " + (question.explication || ""));
    setAfficherExplication(true);
  }

  // 👉 BOUTON QUESTION SUIVANTE
  function questionSuivante() {
    setAfficherExplication(false);
    setExplication("");
    setReponseCliquee(null);
    setQuestionIndex(prev => prev + 1);
  }

  useEffect(() => {
    if (questionIndex >= questions.length && questions.length > 0) {
      setQuizTermine(true);
    }
  }, [questionIndex, questions.length]);

  return (
    <div>

      {!joueurPret ? (
        <FormulaireJoueur onJoueurCree={() => setJoueurPret(true)} />
      ) : null}

      {question && !quizTermine && (
        <div>
          <Score actuel={score} total={questions.length} />

          {/* 🟦 BARRE DE PROGRESSION */}
          <div className="max-w-5xl mx-auto mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Question {questionIndex + 1} / {questions.length}</span>
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

                  {question.reponse?.map((reponse: any) => {
                    let bgColor = "bg-background";

                    if (afficherExplication) {
                      if (reponse.reponse_correct) {
                        bgColor = "bg-green-500 text-white";
                      } else if (reponseCliquee === reponse.id) {
                        bgColor = "bg-red-400 text-white";
                      }
                    }

                    return (
                      <Button
                        key={reponse.id}
                        onClick={() => handleClick(reponse)}
                        disabled={afficherExplication}
                        className={`w-full justify-start mt-2 ${bgColor}`}
                        variant="outline"
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

                      {/* 🔘 BOUTON QUESTION SUIVANTE */}
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
