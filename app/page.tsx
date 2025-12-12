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
    if (joueurPret) {
      const userId = localStorage.getItem("supabase_user_id");
      if (userId) {
        supabase
          .from("joueur")
          .select("pseudo")
          .eq("user_id", userId)
          .single()
          .then(({ data, error }) => {
            if (error) console.error("Erreur récupération joueur :", error);
            else if (data) setJoueurNom(data.pseudo);
          });
      }
    }
  }, [joueurPret]);

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
        setDebut(Date.now());
      }
    }
    fetchQuestion();
  }, []);

  const question = questions[questionIndex];

  function handleClick(reponse: any) {
    if (!question || afficherExplication) return;

    setReponseCliquee(reponse.id);

    const estBonneReponse = reponse.reponse_correct;
    if (estBonneReponse) setScore(prev => prev + 1);

    const message = estBonneReponse ? "✅ Bonne réponse !" : "❌ Mauvaise réponse.";
    const explicationTexte = message + " " + (question.explication || "");
    setExplication(explicationTexte);
    setAfficherExplication(true);

    setTimeout(() => {
      setAfficherExplication(false);
      setExplication("");
      setQuestionIndex(prev => prev + 1);
      setReponseCliquee(null);
    }, 2000);
  }

  async function enregistrerMeilleurScore() {
    const userId = localStorage.getItem("supabase_user_id");
    if (!userId || debut === null || questions.length === 0) return;

    const tempsTotal = Math.floor((Date.now() - debut) / 1000);
    const scoreFinal = score;
    const aujourdHui = new Date().toISOString().split("T")[0];

    const { data: joueur, error } = await supabase
      .from("joueur")
      .select("meilleur_score")
      .eq("user_id", userId)
      .single();

    if (error || !joueur) {
      console.error("Erreur récupération joueur :", error);
      return;
    }

    const ancienMeilleur = joueur.meilleur_score || 0;

    if (scoreFinal > ancienMeilleur) {
      const { error: updateError } = await supabase
        .from("joueur")
        .update({
          meilleur_score: scoreFinal,
          meilleur_temps: tempsTotal,
          date_meilleur_score: aujourdHui,
        })
        .eq("user_id", userId);

      if (updateError) console.error("Erreur mise à jour record :", updateError);
      else console.log("Nouveau record !", scoreFinal, "points en", tempsTotal, "s");
    }
  }

  useEffect(() => {
    if (joueurPret && questionIndex >= questions.length && questions.length > 0 && !quizTermine) {
      setQuizTermine(true);
      enregistrerMeilleurScore();
    }
  }, [questionIndex, questions.length, joueurPret, quizTermine]);

  return (
    <div>
      {/* ---------------------- BIENVENUE / FORMULAIRE ---------------------- */}
      {!joueurPret ? (
        <FormulaireJoueur onJoueurCree={() => setJoueurPret(true)} />
      ) : questionIndex === 0 && !quizTermine ? (
        <Card className="max-w-xl mx-auto mt-6 p-6 bg-primary text-primary-foreground rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Bienvenue {joueurNom} !</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Préparez-vous à tester vos connaissances en cybersécurité.</p>
          </CardContent>
        </Card>
      ) : null}

      {/* ---------------------- QUIZ ---------------------- */}
      {joueurPret && question && !quizTermine && (
        <div>
          <Score actuel={score} total={questions.length} />

          <Card className="max-w-5xl mx-auto mt-8 p-6">
            <div className="flex gap-6">
              {/* IMAGE */}
              <div className="w-1/2">
                <Image
                  src={question.image || "/image/Photo-Malware.png"}
                  alt="Illustration"
                  width={500}
                  height={400}
                  className="rounded w-full"
                />
                {question.image_credit_url && (
                  <Alert className="mt-4 text-sm text-muted-foreground">
                    <AlertDescription>
                      <Link
                        href={question.image_credit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground underline underline-offset-2 hover:text-primary inline-block"
                      >
                        {question.image_credit_nom || "Crédit inconnu"}
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* QUESTION */}
              <div className="w-1/2">
                <CardHeader>
                  <CardTitle>Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium mb-4">{question.texte}</p>
                  {question.reponse?.map((reponse: any) => {
                    let bgColor = "bg-background";
                    if (reponseCliquee === reponse.id) {
                      bgColor = reponse.reponse_correct ? "bg-green-500 text-white" : "bg-red-300 text-white";
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

      {/* ---------------------- FIN DU QUIZ ---------------------- */}
      {quizTermine && (
        <div className="text-center mt-20 max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-primary">Quiz terminé !</h2>
          <Card>
            <CardHeader>
              <CardTitle>Votre résultat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xl">
              <p>Score : <span className="font-bold text-green-600">{score}</span> / {questions.length}</p>
              <p className="text-muted-foreground">
                Temps : {debut ? Math.floor((Date.now() - debut) / 1000) : 0} secondes
              </p>
              {score === questions.length && <p className="text-2xl">Parfait ! 100% de bonnes réponses !</p>}
            </CardContent>
          </Card>
          <div className="mt-8">
            <p className="text-lg mb-4">Merci {joueurNom} pour votre participation !</p>
          </div>
          <Classement />
        </div>
      )}
    </div>
  );
}
