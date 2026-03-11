// import { useEffect } from "react";
// import QuizQuestionCard from "../components/quiz/QuizQuestionCard";
// import { useQuiz } from "../hooks/useQuiz";

// const Quiz = () => {
//   const { questions, answers, loading, generateQuiz, selectAnswer } =
//     useQuiz("notebook-1");

//   useEffect(() => {
//     generateQuiz();
//   }, []);

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-6">
//       <h1 className="text-2xl font-bold">📝 Quiz</h1>

//       {loading && <p>Generating quiz...</p>}

//       {!loading &&
//         questions.map((q) => (
//           <QuizQuestionCard
//             key={q.id}
//             question={q}
//             selectedOption={answers[q.id]}
//             onSelect={(optId) => selectAnswer(q.id, optId)}
//           />
//         ))}
//     </div>
//   );
// };

// export default Quiz;
