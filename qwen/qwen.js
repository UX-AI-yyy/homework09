let API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";



async function qwenchatCompletion(messages, model = "qwen2.5-vl-7b-instruct", max_tokens = 200) {
  let res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      model,
      messages,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      "Authorization": `Bearer ${QWEN_API_KEY}`,
    },
  });
  let json = await res.json();
  return json.choices[0].message.content;
}