import { FaGithubAlt } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="text-gray-600 py-4 mt-auto">
      <div className="container mx-auto text-center overflow-hidden">
        <p>&copy; {new Date().getFullYear()} Trivia More. Created by <a href="https://github.com/MarinCervinschi/TriviaMore" className="inline-flex items-center space-x-1 text-gray-500 hover:text-gray-600">
          <span>Marin Cervinschi</span><FaGithubAlt />
        </a>
        </p>
      </div>
    </footer>
  )
}

