import torch
from gliner import GLiNER
from typing import List
import torch.nn.functional as F
from IndicTransToolkit.processor import IndicProcessor
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoModelForSeq2SeqLM

import os
from dotenv import load_dotenv
load_dotenv()

# torch.device("cuda" if torch.cuda.is_available() else "cpu")

DEVICE_FOR_EMOTION=os.getenv("DEVICE_FOR_EMOTION")
DEVICE_FOR_INDIC_EN=os.getenv("DEVICE_FOR_INDIC_EN")
DEVICE_FOR_EN_INDIC=os.getenv("DEVICE_FOR_EN_INDIC")

# --------------- For Emotion Classification --------------- 
TOP_N_EMOTION = int(os.getenv("TOP_N_EMOTION"))
EMOTION_MODEL = os.getenv("EMOTION_MODEL")

tokenizer = AutoTokenizer.from_pretrained(EMOTION_MODEL)
emotion_model = AutoModelForSequenceClassification.from_pretrained(EMOTION_MODEL)

emotion_model.to(DEVICE_FOR_EMOTION)

id2label = emotion_model.config.id2label

def emotion_classification(user_input: str) -> str:

    THRESHOLD_FOR_EMOTION = float(os.getenv("THRESHOLD_FOR_EMOTION"))
    TEMPERATURE_FOR_EMOTION = float(os.getenv("TEMPERATURE_FOR_EMOTION"))

    inputs = tokenizer(user_input, return_tensors="pt", truncation=True).to(DEVICE_FOR_EMOTION)

    # Run inference
    with torch.no_grad():
        outputs = emotion_model(**inputs)
        logits = outputs.logits/TEMPERATURE_FOR_EMOTION
        probs = F.sigmoid(logits)[0].cpu().numpy()  # multi-label uses sigmoid

    # Get all emotions with probabilities
    results = {id2label[i]: float(probs[i]) for i in range(len(probs))}

    # Sort by probability (descending)
    sorted_results = dict(sorted(results.items(), key=lambda x: x[1], reverse=True))
    filtered = {k: v for k, v in sorted_results.items() if v >= THRESHOLD_FOR_EMOTION}

    emotions = ""
    for emotion, score in list(filtered.items())[:TOP_N_EMOTION]:
        emotions += '\n  ' + emotion

    return emotions

# --------------- Indic - to - Eng ---------------
def indic_to_en(user_input: str, src_lang: str, tgt_lang: str) -> str:

    INDIC_EN = os.getenv("INDIC_EN")
    indic_en_tokenizer = AutoTokenizer.from_pretrained(INDIC_EN, trust_remote_code=True)

    indic_en_model = AutoModelForSeq2SeqLM.from_pretrained(
        INDIC_EN,
        trust_remote_code=True,
        dtype=torch.float16, # performance might slightly vary for bfloat16
        attn_implementation="flash_attention_2"
    ).to(DEVICE_FOR_INDIC_EN)

    indic_en_ip = IndicProcessor(inference=True)

    batch = indic_en_ip.preprocess_batch(
        [user_input],
        src_lang=src_lang,
        tgt_lang=tgt_lang,
    )

    # Tokenize the sentences and generate input encodings
    inputs = indic_en_tokenizer(
        batch,
        truncation=True,
        padding="longest",
        return_tensors="pt",
        return_attention_mask=True,
    ).to(DEVICE_FOR_INDIC_EN)

    # Generate translations using the model
    with torch.no_grad():
        generated_tokens = indic_en_model.generate(
            **inputs,
            use_cache=False,
            min_length=0,
            max_length=256,
            num_beams=5,
            num_return_sequences=1,
        )

    # Decode the generated tokens into text
    generated_tokens = indic_en_tokenizer.batch_decode(
        generated_tokens,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=True,
    )

    # Postprocess the translations, including entity replacement
    translations = indic_en_ip.postprocess_batch(generated_tokens, lang=tgt_lang)

    # Free GPU memory
    del indic_en_model
    del inputs
    torch.cuda.empty_cache()

    return str(translations[0])

# --------------- Eng - to - Indic ---------------
def en_to_indic(user_input: str, src_lang: str, tgt_lang: str) -> str:

    EN_INDIC = os.getenv("EN_INDIC")
    en_indic_tokenizer = AutoTokenizer.from_pretrained(EN_INDIC, trust_remote_code=True)

    en_indic_model = AutoModelForSeq2SeqLM.from_pretrained(
        EN_INDIC,
        trust_remote_code=True,
        dtype=torch.float16, # performance might slightly vary for bfloat16
        attn_implementation="flash_attention_2"
    ).to(DEVICE_FOR_EN_INDIC)

    en_indic_ip = IndicProcessor(inference=True)

    batch = en_indic_ip.preprocess_batch(
        [user_input],
        src_lang=src_lang,
        tgt_lang=tgt_lang,
    )

    # Tokenize the sentences and generate input encodings
    inputs = en_indic_tokenizer(
        batch,
        truncation=True,
        padding="longest",
        return_tensors="pt",
        return_attention_mask=True,
    ).to(DEVICE_FOR_EN_INDIC)

    # Generate translations using the model
    with torch.no_grad():
        generated_tokens = en_indic_model.generate(
            **inputs,
            use_cache=False,
            min_length=0,
            max_length=256,
            num_beams=5,
            num_return_sequences=1,
        )

    # Decode the generated tokens into text
    generated_tokens = en_indic_tokenizer.batch_decode(
        generated_tokens,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=True,
    )

    # Postprocess the translations, including entity replacement
    translations = en_indic_ip.postprocess_batch(generated_tokens, lang=tgt_lang)

    # Free GPU memory
    del en_indic_model
    del inputs
    torch.cuda.empty_cache()

    return str(translations[0])

# --------------- PII Removal ---------------
PII_REMOVAL_MODEL = os.getenv("PII_REMOVAL_MODEL")
PII_REMOVAL_THRESHOLD = float(os.getenv("PII_REMOVAL_THRESHOLD"))

entity_mapping = {
    "Person": "<PERSON>",
    "Organization": "<ORGANIZATION>",
    "Location": "<LOCATION>",
    "DateTime": "<DATE_TIME>",
    "PhoneNumber": "<PHONE_NUMBER>",
    "CreditCardNumber": "<CREDIT_CARD_NUMBER>"
}
def anonymize_text(text: str, entities: List[dict]) -> str:
    anonymized_text = text
    for entity in entities:
        anonymized_text = anonymized_text.replace(entity["text"], entity_mapping.get(entity["label"], f"<{entity['label']}>"))
    return anonymized_text
def predict_entities_and_anonymize(text: str, labels: List[str]):
    model = GLiNER.from_pretrained(PII_REMOVAL_MODEL)
    entities = model.predict_entities(text, labels, threshold=PII_REMOVAL_THRESHOLD)
    return anonymize_text(text, entities)

# --------------- Main Functions ---------------
def pre_processing(user_input: str, src_lang: str, tgt_lang: str) -> str:

    indic_en = indic_to_en(user_input, src_lang, tgt_lang)
    
    emotions = emotion_classification(indic_en)
    
    labels = ["Person", "Organization", "PhoneNumber", "CreditCardNumber", "Location", "DateTime"]  # Use "Location" for City and Country combined
    pii_removed_text = predict_entities_and_anonymize(indic_en, labels)
    
    new_query=f"""
    Query: 
        {pii_removed_text}

    Emotions:
        {emotions}
    """

    return new_query

def post_processing(ai_output: str, src_lang: str, tgt_lang: str) -> str:

    en_indic = en_to_indic(ai_output, src_lang, tgt_lang)
    
    return en_indic