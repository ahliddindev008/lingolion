from functools import lru_cache
from io import BytesIO

from deep_translator import GoogleTranslator, MyMemoryTranslator
from deep_translator.exceptions import TooManyRequests
import speech_recognition as sr


class TranslationServiceError(Exception):
    pass


class TranslationRateLimitError(TranslationServiceError):
    pass


class SpeechNotRecognizedError(Exception):
    pass


class SpeechRecognitionError(Exception):
    pass


@lru_cache(maxsize=1)
def _mymemory_languages() -> dict[str, str]:
    return MyMemoryTranslator(source="english", target="english").get_supported_languages(as_dict=True)


def _mymemory_language_name(language_code: str) -> str:
    language_prefix = language_code.lower().split("-", 1)[0]
    for language_name, supported_code in _mymemory_languages().items():
        if supported_code.lower().split("-", 1)[0] == language_prefix:
            return language_name
    raise TranslationServiceError(f"MyMemory does not support language code: {language_code}")


@lru_cache(maxsize=256)
def translate_text(text: str, source_language: str, target_language: str) -> str:
    try:
        translated_text = GoogleTranslator(source=source_language, target=target_language).translate(text)
    except TooManyRequests as error:
        try:
            translated_text = MyMemoryTranslator(
                source=_mymemory_language_name(source_language),
                target=_mymemory_language_name(target_language),
            ).translate(text)
        except Exception as fallback_error:
            raise TranslationRateLimitError from fallback_error
    except Exception as error:
        raise TranslationServiceError from error

    if not isinstance(translated_text, str) or not translated_text.strip():
        raise TranslationServiceError
    return translated_text


def recognize_speech(audio_data: bytes, language: str) -> str:
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(BytesIO(audio_data)) as audio_file:
            recording = recognizer.record(audio_file)
        text = recognizer.recognize_google(recording, language=language)
    except sr.UnknownValueError as error:
        raise SpeechNotRecognizedError from error
    except sr.RequestError as error:
        raise SpeechRecognitionError from error
    except (OSError, ValueError, EOFError) as error:
        raise SpeechRecognitionError from error

    if not text.strip():
        raise SpeechNotRecognizedError
    return text