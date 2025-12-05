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


export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [explication, setExplication] = useState("");
  const [afficherExplication, setAfficherExplication] = useState(false);
  const [joueurPret, setJoueurPret] = useState(false);
  const [joueurNom, setJoueurNom] = useState<string>('Sans nom');
  const [score, setScore] = useState(0);

  useEffect(() => {
    // On ne lance la récupération que si joueurPret est passé à 'true'
    if (joueurPret) {
      const userId = localStorage.getItem("supabase_user_id");
      if (userId) {
        supabase
          .from("joueur")
          .select("pseudo")
          .eq("user_id", userId)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error("Erreur lors de la récupération du joueur :", error);
            } else if (data) {
              setJoueurNom(data.pseudo);
            }
          });
      }
    }
  }, [joueurPret]); // <-- On ajoute joueurPret comme dépendance



  useEffect(() => {
    // On ne lance la récupération que si joueurPret est passé à 'true'
    if (joueurPret) {
      const userId = localStorage.getItem("supabase_user_id");
      if (userId) {
        supabase
          .from("joueur")
          .select("pseudo")
          .eq("user_id", userId)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error("Erreur lors de la récupération du joueur :", error);
            } else if (data) {

            }
          });
      }
    }
  }, []);


  useEffect(() => {
    async function fetchQuestion() {
      const { data, error } = await supabase
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
        .order('id', { ascending: true });

      if (error) console.error(error);
      else {
        setQuestions(data || []);
        console.log(data[0]);
      }
    }
    fetchQuestion();
  }, []);


  const question = questions[questionIndex];

  function handleClick(reponse: any) {
    if (!question || afficherExplication) return;

    const estBonneReponse = reponse.reponse_correct;

    if (estBonneReponse) {
      setScore((prev) => prev + 1);
    }

    const message = estBonneReponse ? "✅ Bonne réponse !" : "❌ Mauvaise réponse.";
    const explicationTexte = message + " " + question.explication || message;
    
    setExplication(explicationTexte);
    setAfficherExplication(true);

    setTimeout(() => {
      setAfficherExplication(false);
      setExplication("");
      setQuestionIndex((prev) => prev + 1);
    }, 4000);
  }

  // Quand il n’y a plus de questions
  if (!question) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold">Quiz terminé !</h2>
        <p className="mt-4 text-muted-foreground">Merci d’avoir participé.</p>
      </div>
    );
  }

  return (
    <div>
      {!joueurPret ? (
        <FormulaireJoueur onJoueurCree={() => setJoueurPret(true)} />
      ) : (
        // Affichage du quiz
        <div>
          <Alert className="bg-green-50 border-green-300 text-green-800 max-w-xl mx-auto mt-6">
            <AlertTitle className="text-xl font-semibold">
              Bienvenue {joueurNom} !
            </AlertTitle>
            <AlertDescription>
              Préparez-vous à tester vos connaissances en cybersécurité.
            </AlertDescription>
          </Alert>
          <Card className="max-w-5xl mx-auto mt-8 p-6">
            <div className="flex gap-6">
              {joueurNom && (
                <>
                  <Alert className="bg-blue-50 border-blue-300 text-blue-800 max-w-xl mx-auto mt-6">
                    <AlertTitle className="text-xl font-semibold">
                      Bienvenue {joueurNom} !
                    </AlertTitle>
                    <AlertDescription>
                      Préparez-vous à tester vos connaissances en cybersécurité.
                    </AlertDescription>
                  </Alert>

                  <Score actuel={score} total={questions.length} />
                </>
              )}


              {/* IMAGE */}
              <div className="w-1/2">
                <Image
                  src="/image/Photo-Malware.png"
                  alt="Illustration"
                  width={500}
                  height={400}
                  className="rounded w-full"
                />

                <Alert className="mt-4 text-sm text-muted-foreground">
                  <AlertDescription>
                    <Link
                      href="https://pixabay.com/users/satheeshsankaran-11196627/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-primary"
                    >
                    </Link>
                  </AlertDescription>
                </Alert>
              </div>

              {/* QUESTION */}
              <div className="w-1/2">
                <CardHeader>
                  <CardTitle>Question</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="font-medium mb-4">{question?.texte}</p>

                  {question?.reponse?.map((reponse: any) => (
                    <Button
                      key={reponse.id}
                      onClick={() => handleClick(reponse)}
                      disabled={afficherExplication}
                      className="w-full justify-start mt-2"
                      variant="outline"
                    >
                      {reponse.texte}
                    </Button>
                  ))}
                </CardContent>

                {afficherExplication && (
                  <Alert className="mt-6 bg-yellow-50 border-yellow-300 text-yellow-800">
                    <AlertTitle>Explication</AlertTitle>
                    <AlertDescription>{explication}</AlertDescription>
                  </Alert>
                )}
              </div>

            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
