"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from "next/link";

export default function Home() {
  const [question, setQuestion] = useState<any>(null);

  useEffect(() => {
    async function fetchQuestion() {
      const { data, error } = await supabase
        .from('question')
        .select(`
          id,
          texte,
          image,
          reponse:reponse (
            id,
            texte,
            reponse_correct
          )
        `)
        .order('id', { ascending: true });

      if (error) console.error(error);
      else {
        setQuestion(data[0]); // On stocke la première question dans l’état
        console.log(data[0]);
      }
    }
    fetchQuestion();
  }, []);
  function handleClick(reponse: any) {
    if (reponse.est_correcte) {
      alert("Bonne réponse !");
    } else {
      alert("Mauvaise réponse.");
    }
  }

  return (
    <div>

      <Alert className="bg-blue-50 border-blue-300 text-blue-800 max-w-xl mx-auto mt-6">
        <AlertTitle className="text-xl font-semibold">Bienvenue sur CyberQuiz</AlertTitle>
        <AlertDescription>
          Un quiz pour tester vos connaissances en cybersécurité.
        </AlertDescription>
      </Alert>


      <div className='flex'>
        <div className="w-1/2">


          <Card className="max-w-xl mx-auto mt-6">

            <Image
              src="/image/Photo-Malware.png"
              alt="Illustration"
              width={400}
              height={300}
              className="rounded"
            />
            <Alert className="mt-4 text-sm text-muted-foreground">
              <AlertDescription>
                <Link
                  href="https://pixabay.com/users/satheeshsankaran-11196627/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-primary"
                >
                  satheeshsankaran
                </Link>
              </AlertDescription>
            </Alert>
          </Card>
        </div>

        <div className="w-1/2">
          {question ? (
            <Card className="max-w-xl mx-auto mt-6">
              <CardHeader>
                <CardTitle>Question</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{question.texte}</p>

                {question.reponse?.map((reponse: any) => (
                  <Button
                    key={reponse.id}
                    className="w-full justify-start mt-4"
                    variant="outline"
                    onClick={() => handleClick(reponse)}
                  >
                    {reponse.texte}
                  </Button>
                ))}

              </CardContent>
            </Card>
          ) : (
            <p>Chargement de la question...</p>
          )
          }
        </div>

      </div>


    </div>
  )
}