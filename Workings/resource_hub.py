import requests
from openpyxl import Workbook

API_KEY = "AIzaSyBXK0ajzIHPphHRIVIPhsrmc1AP4c-EtS8"

languages = [
    "Hindi", "English", "Assamese", "Bengali", "Bodo", "Dogri", "Gujarati",
    "Kannada", "Kashmiri", "Konkani", "Maithili", "Malayalam", "Marathi",
    "Meitei", "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali", "Sindhi",
    "Tamil", "Telugu"
]

def fetch_youtube_videos_multilingual():
    max_results = 10
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "YouTube Videos"
    sheet.append(["Video URL", "Topic", "Language"])

    for language in languages:
        query = f"motivational videos in {language}"
        search_url = (
            f"https://www.googleapis.com/youtube/v3/search"
            f"?part=snippet&type=video&q={requests.utils.quote(query)}"
            f"&maxResults={max_results}&key={API_KEY}"
        )

        try:
            search_response = requests.get(search_url)
            search_response.raise_for_status()
            search_data = search_response.json()

            video_ids = ",".join([item["id"]["videoId"] for item in search_data.get("items", [])])
            if not video_ids:
                continue

            details_url = (
                f"https://www.googleapis.com/youtube/v3/videos"
                f"?part=snippet&id={video_ids}&key={API_KEY}"
            )
            details_response = requests.get(details_url)
            details_response.raise_for_status()
            details_data = details_response.json()

            for video in details_data.get("items", []):
                video_id = video["id"]
                video_url = f"https://www.youtube.com/watch?v={video_id}"
                title = video["snippet"]["title"].lower()
                description = video["snippet"]["description"].lower()

                topic = "general"
                if "depression" in title or "depression" in description:
                    topic = "depression"
                elif "anxiety" in title or "anxiety" in description:
                    topic = "anxiety"
                elif "sad" in title or "sad" in description:
                    topic = "sadness"
                elif any(word in title or word in description for word in ["motivation", "motivational"]):
                    topic = "motivation"

                sheet.append([video_url, topic, language])

        except requests.exceptions.RequestException as e:
            print(f"Error for language {language}: {e}")

    workbook.save("youtube_videos.xlsx")
    print("Results saved to youtube_videos.xlsx")


if __name__ == "__main__":
    fetch_youtube_videos_multilingual()