import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MENTIONS = [
  { max: 25, label: 'Courage', color: 'text-red-600', bg: 'bg-red-50' },
  { max: 40, label: 'Encore des efforts à faire', color: 'text-orange-600', bg: 'bg-orange-50' },
  { max: 55, label: 'Travailler plus', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  { max: 70, label: 'Passable', color: 'text-blue-600', bg: 'bg-blue-50' },
  { max: 85, label: 'Vous pouvez y arriver', color: 'text-green-600', bg: 'bg-green-50' },
  { max: 100, label: 'Félicitations !', color: 'text-green-700', bg: 'bg-green-100' },
];

function getMention(percent) {
  const p = Math.min(100, Math.max(0, percent));
  for (const m of MENTIONS) {
    if (p <= m.max) return m;
  }
  return MENTIONS[MENTIONS.length - 1];
}

export default function SimulationPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(60 * 60);

  const loadExam = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/exams/${id}`);
      const data = res.data;
      if (data?.exercises?.length > 0) {
        setExam({
          id: data.id,
          title: data.title || `Épreuve ${data.subject || ''}`,
          subject: data.subject,
          exercises: data.exercises,
        });
        const total = data.exercises.reduce((s, e) => s + (e.points || 1), 0);
        setTotalPoints(total);
        setDurationSeconds(Math.max(60 * 10, data.exercises.length * 90));
      } else {
        setExam(null);
      }
    } catch (err) {
      console.error('Error loading exam:', err);
      setExam(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  useEffect(() => {
    if (!started || !exam || timeLeft === null) return;
    if (timeLeft <= 0) {
      finishSimulation();
      return;
    }
    const t = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [started, exam, timeLeft]);

  const handleAnswer = (exerciseId, selected) => {
    const ex = exam.exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    const correct = ex.type === 'qcm' && ex.correct_answer === selected;
    setAnswers((prev) => ({ ...prev, [exerciseId]: { selected, correct } }));
  };

  const finishSimulation = () => {
    setFinished(true);
  };

  const getCurrentScore = () => {
    if (!exam?.exercises) return 0;
    return exam.exercises.reduce((s, e) => s + (answers[e.id]?.correct ? (e.points || 1) : 0), 0);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-gray-600 mb-4">Épreuve introuvable ou sans exercices.</p>
        <button
          onClick={() => navigate('/archives')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retour aux archives
        </button>
      </div>
    );
  }

  const exercises = exam.exercises;
  const totalPts = totalPoints || exercises.reduce((s, e) => s + (e.points || 1), 0);

  if (finished) {
    const finalScore = getCurrentScore();
    const percent = totalPts > 0 ? Math.round((finalScore / totalPts) * 100) : 0;
    const mention = getMention(percent);
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Résultat de la simulation</h1>
          <p className="text-gray-600 mb-6">{exam.title}</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{getCurrentScore()} / {totalPts}</div>
              <div className="text-sm text-gray-600">Points obtenus</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{percent} %</div>
              <div className="text-sm text-gray-600">Pourcentage</div>
            </div>
          </div>
          <div className={`rounded-lg p-6 text-center ${mention.bg}`}>
            <p className={`text-xl font-bold ${mention.color}`}>{mention.label}</p>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate('/archives')}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retour aux archives
            </button>
            <button
              onClick={() => {
                setFinished(false);
                setStarted(false);
                setAnswers({});
                setCurrentIndex(0);
                setTimeLeft(durationSeconds);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Refaire la simulation
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{exam.title}</h1>
          <p className="text-gray-600 mb-4">{exam.subject}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
              {exercises.length} question(s)
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
              Durée : {Math.floor(durationSeconds / 60)} min
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
              Total : {totalPts} point(s)
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            La simulation est chronométrée. Les points s&apos;ajoutent lorsque vous cochez la bonne réponse.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setStarted(true);
                setTimeLeft(durationSeconds);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Démarrer la simulation
            </button>
            <button
              onClick={() => navigate('/archives')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ex = exercises[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentScore = getCurrentScore();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-lg">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-semibold">
              {currentScore} / {totalPts} pts
            </span>
          </div>
        </div>
        <div className="mb-4 text-sm text-gray-500">
          Question {currentIndex + 1} / {exercises.length}
        </div>
        <div className="border border-gray-200 rounded-lg p-5 mb-6">
          <p className="font-medium text-gray-900 mb-4">{ex.question_text}</p>
          {ex.type === 'qcm' && ex.options && Array.isArray(ex.options) && (
            <ul className="space-y-2">
              {ex.options.map((opt, i) => (
                <li key={i}>
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name={`q-${ex.id}`}
                      checked={answers[ex.id]?.selected === opt}
                      onChange={() => handleAnswer(ex.id, opt)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>{opt}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          {ex.type === 'open' && (
            <p className="text-sm text-gray-500 italic">
              Question ouverte — vérifiez la correction dans « Voir le contenu » de l&apos;épreuve.
            </p>
          )}
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          {currentIndex < exercises.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={finishSimulation}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Terminer et voir le résultat
            </button>
          )}
        </div>
        {timeLeft <= 0 && (
          <p className="mt-4 text-amber-600 font-medium">Temps écoulé. Cliquez sur « Terminer et voir le résultat ».</p>
        )}
      </div>
    </div>
  );
}
