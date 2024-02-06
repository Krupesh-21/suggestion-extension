import { GoogleGenerativeAI } from '@google/generative-ai';
import { useEffect, useState } from 'react';

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  const generateResponse = async (messages = []) => {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 10000,
      },
    });

    try {
      const result = await chat.sendMessage(
        'Suggest multiple responses in numbered bullet form considering last message based on these conversation between two users.' +
          '\n' +
          messages.map(item => item.text).join('\n'),
      );
      const response = await result.response;
      const text = await response.text();
      const suggestion = text
        .split('\n')
        .filter(item => item.trim() !== '')
        .map(str => str.replace(/^\d+\.\s*/, ''));

      // Send the response back to the content.js script

      const smartReplyContainer = Array.from(document.querySelector('[data-tid="smart-replies-renderer"]')?.childNodes);
      const messageContainer = smartReplyContainer.find(item => (item as HTMLElement).classList.contains('fui-Flex'))
        ?.firstChild;

      if (messageContainer) {
        suggestion.forEach((item, i) => {
          const button = document.createElement('button');
          button.innerText = item;
          button.className =
            'fui-Button r1alrhcs ___m0y6240 f3c24fr f1g0x7ka fw6w4fj f1qch9an fb5u4ab f1aa9q02 f16jpd5f f1jar5jt fyu767a fy9rknc fl43uef fwrc4pm fg3gtdo fwii5mg f1palphq f12nxie7 f1hu3pq6 f1nnb54t f1yrx710 ft1hn21 fuxngvv fkswwiz fz5stix f1c6jg8l f6z23yc f17aye20 f1u8pn5z f16muhyy f1couhl3 fjc5sf5 fenegdw frvze4h f15wnd8a f1d7uzvz f51d5ct f3q8k0u f139oj5f fzrd9l2 f19b6rc1 fx7oyu6 f784lqe f1h648pw f7tkmfy foky84l f7u1hbh fy8dw04 fuspmkf fbmy5og f1bpdera fs23r2p f15himi8 fah1kgb f11pwudj fbr7jg7 f75pg3s f1aaoui7 f1xnd9hs f1cw7fiu ft1dyul f4ceeba f1gjv7df';
          button.dataset.track = 'false';
          button.dataset.tabster = '{ restorer: { type: 1 } }';
          button.id = `menu${i}`;

          // button.addEventListener('click', e => {
          const inputField = document.querySelector('.ck-editor__editable');
          console.log('raj', inputField);
          //   // if (inputField) inputField.ckeditorInstance.setData(e.target.innerText);

          //   const sendButton = document.querySelector('[data-tid="newMessageCommands-send"]');
          //   if (sendButton) sendButton.click();
          // });

          messageContainer.insertBefore(
            button,
            Array.from(messageContainer.childNodes)[Array.from(messageContainer.childNodes).length - 1],
          );
        });
      }
    } catch (error) {
      // Handle any errors that occurred during the asynchronous operations
      console.error('An error occurred during message processing:', error, 'raj');
    } finally {
      setIsLoaded(false);
    }
  };

  useEffect(() => {
    console.log('content view loaded');
    const targetNode = document.body;

    // Options for the observer (which mutations to observe)
    const config = { childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = mutationList => {
      const isPnaelLoaded = mutationList.some(
        item => item.target.id === 'chat-pane-list' || item.target.id === 'code-section',
      );

      if (isPnaelLoaded && !isLoaded) setIsLoaded(isPnaelLoaded);
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // const script = document.createElement('script');
    // script.src = '../../../../src/ckeditor.js';
    // script.defer = true;
    // document.body.appendChild(script);
    // console.log('ClassicEditor', ClassicEditor);
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
        return { text: el ? (el as HTMLElement).innerText : '' };
      });

      generateResponse(newMessages);
    }
  }, [isLoaded]);

  return <></>;
}
