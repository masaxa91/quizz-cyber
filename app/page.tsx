"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';


export default function Home() {
  const [question, setQuestion] = useState<any>(null);

  useEffect(() => {
    async function fetchQuestion() {
      const { data, error } = await supabase
        .from('question')
        .select('*')

      if (error) console.error(error);
      else console.log(data);
    }

    fetchQuestion();
  }, []);

  async function fetchQuestion() {
    const { data, error } = await supabase
      .from('question')
      .select('*');

    if (error) console.error(error);
    else setQuestion(data[0]); // On stocke la première question dans l’état
  }

  return (
    <div>
      <h1>Bienvenue sur CyberQuiz</h1>

      {question ? (
        <div>
          <h2>{question.texte}</h2>
        </div>
      ) : (
        <p>Chargement de la question...</p>
      )}

    </div>
  );
}