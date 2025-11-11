from models.schemas import Question, TimestampedQuestion


class H5PService:

    def create_quiz(self, questions: list[TimestampedQuestion], title: str) -> dict:
        """
        Convierte preguntas a formato H5P Multiple Choice
        Mantener para backward compatibility (sin timestamps)
        :param questions:
        :param title:
        :return:
        """

        h5p_questions = []

        for q in questions:
            h5p_question = {
                "library": "H5P.MultiChoice 1.16",
                "params": {
                    "question": q.question,
                    "answer": [
                        {
                            "text": answer,
                            "correct": i == q.correct_answer,
                            "tipsAndFeedback": {
                                "tip": "",
                                "chosenFeedback": q.explanation if i == q.correct_answer else "",
                            }
                        }
                        for i, answer in enumerate(q.answers)
                    ]
                }
            }
            h5p_questions.append(h5p_question)

        h5p_content = {
            "title": title,
            "questions": h5p_questions
        }

        return h5p_content

    def create_interactive_video(
            self,
            questions: list[TimestampedQuestion],
            video_url: str,
            title: str) -> dict:

        """
        Crea H5P interactive video con preguntas en timestamps
        :param questions:
        :param video_url:
        :param title:
        :return:
        """

        interactions = []

        for idx, q in enumerate(questions):
            interaction = {
                "x": 0,
                "y": 0,
                "width": 10,
                "height": 10,
                "duration": {
                    "from": q.timestamp,
                    "to": q.timestamp,
                },
                "libraryTitle": "Multiple Choice",
                "action": {
                    "library": "H5P.MultiChoice 1.16",
                    "params": {
                        "question": q.question,
                        "answer": [
                            {
                                "text": answer,
                                "correct": i == q.correct_answer,
                                "tipsAndFeedback": {
                                    "tip": "",
                                    "chosenFeedback": q.explanation if i == q.correct_answer else "",
                                }
                            }
                            for i, answer in enumerate(q.answers)
                        ],
                        "behaviors": {
                            "enableRetry": True,
                            "enableSolutionsButton": True,
                        }
                    },
                    "subContentId": str(idx),
                },
                "pause": True,
                "displayType": "poster",
                "buttonOnMobile": False,
                "visuals": {
                    "backgroundColor": "rgba(255,255,255,0.9)",
                    "boxShadow": True,
                },
                "label": f"<p>Pregunta {idx+1}</p>\n",
            }

            interactions.append(interaction)

            h5p_content = {
                "interactiveVideo": {
                    "video": {
                        "startScreenOptions": {
                            "title": title,
                            "hideStartTitle": False
                        },
                        "files": [
                            {
                                "path": video_url,
                                "mime": "video/YouTube",
                                "copyright": {
                                    "license": "U"
                                }
                            }
                        ]
                    },
                    "assets": {
                        "interactions": interactions
                    },
                    "summary": {
                        "task": {
                            "library": "H5P.Summary 1.10",
                            "params": {},
                            "subContentId": "summary",
                        },
                        "displayAt": 3
                    }
                }
            }

            return h5p_content


h5p_service = H5PService()