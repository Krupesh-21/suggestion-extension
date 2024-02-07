// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useEffect, useState } from 'react';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  const generateResponse = async (messages = []) => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const history = [
      {
        role: 'user',
        parts: messages.map(item => ({ text: item.text })),
      },
      {
        role: 'model',
        parts: [{ text: 'hi' }],
      },
    ];

    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 10000,
      },
      history,
    });

    try {
      const result = await chat.sendMessage(
        'Suggest only 3 to 5 responses with only 50 characters in numbered list form considering last message based on these conversation between two users. and do not include character count in your response and in numbered list strictly.',
      );

      const response = await result.response;
      const text = await response.text();

      const suggestion = text
        .split('\n')
        .filter(item => item.trim() !== '')
        .map(str => str.replace(/^\d+\.\s*/, ''));

      // Send the response back to the content.js script

      if (document.getElementById('ai-suggestion')) {
        document.getElementById('ai-suggestion').remove();
      }

      const div = document.createElement('div');
      div.id = 'ai-suggestion';
      div.style.display = 'flex';
      div.style.margin = '5px 0';
      div.style.gap = '5px';
      div.style.flexWrap = 'wrap';

      suggestion.forEach((item, i) => {
        const button = document.createElement('button');
        button.innerText = item;
        button.className =
          'fui-Button r1alrhcs ___m0y6240 f3c24fr f1g0x7ka fw6w4fj f1qch9an fb5u4ab f1aa9q02 f16jpd5f f1jar5jt fyu767a fy9rknc fl43uef fwrc4pm fg3gtdo fwii5mg f1palphq f12nxie7 f1hu3pq6 f1nnb54t f1yrx710 ft1hn21 fuxngvv fkswwiz f1c6jg8l f6z23yc f17aye20 f1u8pn5z f16muhyy f1couhl3 fjc5sf5 fenegdw frvze4h f15wnd8a f1d7uzvz f51d5ct f3q8k0u f139oj5f fzrd9l2 f19b6rc1 fx7oyu6 f784lqe f1h648pw f7tkmfy foky84l f7u1hbh fy8dw04 fuspmkf fbmy5og f1bpdera fs23r2p f15himi8 fah1kgb f11pwudj fbr7jg7 f75pg3s f1aaoui7 f1xnd9hs f1cw7fiu ft1dyul f4ceeba f1gjv7df';
        button.dataset.track = 'false';
        button.dataset.tabster = '{ restorer: { type: 1 } }';
        button.id = `menu${i}`;

        div.appendChild(button);

        button.addEventListener('click', e => {
          // if (inputField) inputField.ckeditorInstance.setData(e.target.innerText);
          const el = document.querySelector('.ck-editor__editable');
          if (el) {
            navigator.clipboard.writeText((e.target as HTMLElement).innerText);
            (el as HTMLElement).focus();
            (e.target as HTMLElement).innerHTML = '&check;' + ' Copied ' + (e.target as HTMLElement).innerText;

            setTimeout(() => div.remove(), 1000);
          }

          // const sendButton = document.querySelector('[data-tid="newMessageCommands-send"]');
          // if (sendButton) sendButton.click();
        });
      });

      const nodes = document.querySelector('[data-tid="chat-pane-compose-message-footer"]').childNodes;
      let _nodes = [];

      _nodes = Array.from(nodes);

      _nodes.forEach(item => {
        if (item.classList.contains('ui-box')) {
          document.querySelector('[data-tid="chat-pane-compose-message-footer"]').insertBefore(div, item);
        }
      });
    } catch (error) {
      // Handle any errors that occurred during the asynchronous operations
      console.error('An error occurred during message processing:', error, 'raj');
    } finally {
      setIsLoaded(false);
    }
  };

  useEffect(() => {
    const targetNode = document.body;

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = mutationList => {
      const isPnaelLoaded = mutationList.some(
        item =>
          item.target.id === 'chat-pane-list' &&
          item.target.id !== 'ai-suggesstion' &&
          Array.from(document.body.querySelectorAll('[data-tid="chat-pane-message"]')).length > 0,
      );

      if (isPnaelLoaded && !isLoaded) setIsLoaded(isPnaelLoaded);
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const messages = Array.from(document.body.querySelectorAll('[data-tid="chat-pane-message"]'));
      let newMessages = [];

      if (messages.length > 10) {
        newMessages = messages.slice(Math.max(messages.length - 10, 0));
      }

      newMessages = messages.map(item => {
        const el = Array.from(item.childNodes).find(m => (m as HTMLElement).id.startsWith('content-'));
        return {
          text: el ? (el as HTMLElement).innerText : '',
          self: item.classList.contains('fui-ChatMyMessage__body'),
        };
      });

      if (newMessages[newMessages.length - 1] != null && !newMessages[newMessages.length - 1]?.self) {
        generateResponse(newMessages);
      }
    }
  }, [isLoaded]);

  return <></>;
}
