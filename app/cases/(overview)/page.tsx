'use client';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRef, useEffect, useState } from 'react';

import atherisAwp from '../../../public/atheris_awp.png';
import brokenFangCase from '../../../public/broken_fang_case.png';
import imperialPlaidGloves from '../../../public/imperial_plaid_gloves.png';
import asiimovAk from '../../../public/asiimov_ak.png';
import loreBayonetKnife from '../../../public/lore_bayonet_knife.png';
import stonewashBayonetKnife from '../../../public/stonewash_bayonet_knife.png';
import printstreamDeagle from '../../../public/printstream_deagle.png';
import pulseFamas from '../../../public/pulse_famas.png';
import desolateSpaceM4a4 from '../../../public/desolate_space_m4a4.png';
import thorNegev from '../../../public/thor_negev.png';

// TODO: env var
const BACKEND_SERVER_URL = 'http://localhost:3000/api/cases';

// const skins = [
//   'broken_fang_case',
//   'imperial_plaid_gloves',
//   'atheris_awp',
//   'asiimov_ak',
//   'lore_bayonet_knife',
//   'stonewash_bayonet_knife',
//   'printstream_deagle',
//   'pulse_famas',
//   'desolate_space_m4a4',
//   'thor_negev'
// ];
const skinsToAmount = {
  broken_fang_case: 1,
  imperial_plaid_gloves: 200,
  atheris_awp: 20,
  asiimov_ak: 50,
  lore_bayonet_knife: 150,
  stonewash_bayonet_knife: 100,
  printstream_deagle: 15,
  pulse_famas: 10,
  desolate_space_m4a4: 10,
  thor_negev: 10
};

const SlotWindow = styled('div')({
  height: '288px',
  overflow: 'hidden',
  width: '100vw',
  display: 'flex'
});

const imagePixelHeight = 288;
const imagePixelWidth = 384;
const viewWidth = imagePixelWidth * 2;

const memoSine = {};
const sine = (x: number) => {
  if (x in memoSine) {
    return memoSine[x];
  } else {
    let sinVal = (Math.sin(3.3 * x + 4.6) + 0.999) / 1.99;
    memoSine[x] = sinVal;
    return sinVal;
  }
};

export default function Page() {
  // console.log('rendering cases page');

  const canvasRef = useRef(null);
  const lineCanvasRef = useRef(null);

  const [animationState, setAnimationState] = useState(0);

  const [caseWinner, setCaseWinner] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [previousAccountBalance, setPreviousAccountBalance] = useState(null);
  const [newAccountBalance, setNewAccountBalance] = useState(null);
  const [newCaseWinner, setNewCaseWinner] = useState(null);

  const [spinsHistory, setSpinsHistory] = useState([]);

  let animationFrameId;

  let image1Position = 0;
  let image2Position = 384;
  let image3Position = 768;

  let image1DisplayImage = 0;
  let image2DisplayImage = 1;
  let image3DisplayImage = 2;

  const draw = (ctx, images, step, displacement, positionValues) => {
    // console.log('step', step);
    // console.log('displacement', displacement);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    image1Position = image1Position - step;

    image2Position = image2Position - step;

    image3Position = image3Position - step;

    if (step > 0) {
      if (image1Position < -imagePixelWidth) {
        let diff = -imagePixelWidth - image1Position; // How much further is it from the edge?
        image1Position = 768 - diff;
        image1DisplayImage = image1DisplayImage + 3;

        // console.log('resetting image1');
      } else if (image2Position < -imagePixelWidth) {
        let diff = -imagePixelWidth - image2Position; // How much further is it from the edge?
        image2Position = 768 - diff;
        image2DisplayImage = image2DisplayImage + 3;

        // console.log('resetting image2');
      } else if (image3Position < -imagePixelWidth) {
        let diff = -imagePixelWidth - image3Position; // How much further is it from the edge?
        image3Position = 768 - diff;
        image3DisplayImage = image3DisplayImage + 3;

        // console.log('resetting image3');
      }
    } else {
      if (image1Position > viewWidth) {
        let diff = image1Position - viewWidth;
        image1Position = -imagePixelWidth + diff;
        image1DisplayImage = image1DisplayImage - 3;

        // console.log('opposite resetting image1');
      } else if (image2Position > viewWidth) {
        let diff = image2Position - viewWidth;
        image2Position = -imagePixelWidth + diff;
        image2DisplayImage = image2DisplayImage - 3;

        // console.log('opposite resetting image2');
      } else if (image3Position > viewWidth) {
        let diff = image3Position - viewWidth;
        image3Position = -imagePixelWidth + diff;
        image3DisplayImage = image3DisplayImage - 3;

        // console.log('opposite resetting image3');
      }
    }

    // This is where to start drawing
    let image1Image =
      images[
        positionValues[image1DisplayImage < 0 || image1DisplayImage >= positionValues.length ? 0 : image1DisplayImage]
      ]['image'];
    let image1FillStyle =
      images[
        positionValues[image1DisplayImage < 0 || image1DisplayImage >= positionValues.length ? 0 : image1DisplayImage]
      ]['fillStyle'];

    ctx.fillStyle = image1FillStyle;
    ctx.fillRect(image1Position, 0, imagePixelWidth, imagePixelHeight);
    ctx.strokeRect(image1Position, 0, imagePixelWidth, imagePixelHeight);
    ctx.drawImage(image1Image, image1Position, 0);

    let image2Image =
      images[
        positionValues[image2DisplayImage < 0 || image2DisplayImage >= positionValues.length ? 0 : image2DisplayImage]
      ]['image'];
    let image2FillStyle =
      images[
        positionValues[image2DisplayImage < 0 || image2DisplayImage >= positionValues.length ? 0 : image2DisplayImage]
      ]['fillStyle'];

    ctx.fillStyle = image2FillStyle;
    ctx.fillRect(image2Position, 0, imagePixelWidth, imagePixelHeight);
    ctx.strokeRect(image2Position, 0, imagePixelWidth, imagePixelHeight);
    ctx.drawImage(image2Image, image2Position, 0);

    let image3Image =
      images[
        positionValues[image3DisplayImage < 0 || image3DisplayImage >= positionValues.length ? 0 : image3DisplayImage]
      ]['image'];
    let image3FillStyle =
      images[
        positionValues[image3DisplayImage < 0 || image3DisplayImage >= positionValues.length ? 0 : image3DisplayImage]
      ]['fillStyle'];
    ctx.fillStyle = image3FillStyle;
    ctx.fillRect(image3Position, 0, imagePixelWidth, imagePixelHeight);
    ctx.strokeRect(image3Position, 0, imagePixelWidth, imagePixelHeight);
    ctx.drawImage(image3Image, image3Position, 0);
  };

  const lineDraw = ctx => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    const centerX = viewWidth / 2;
    // Start a new path
    ctx.beginPath();
    // Move to the starting point (top of the center)
    ctx.moveTo(centerX, 0);
    // Draw a line to the bottom of the canvas (same x, different y)
    ctx.lineTo(centerX, 288);
    // Draw the line
    ctx.stroke();
  };

  const animate = (ctx, frameCount, images, durationCounter, positionValues) => {
    if (frameCount > durationCounter) {
      setAnimationState(0);
      console.log('finished drawing');
      // update the winner values
      setNewAccountBalance(accountBalance);
      setNewCaseWinner(caseWinner);
      return;
    }

    const displacement = (sine(frameCount / durationCounter) - sine(0)) * (36 * durationCounter);
    let step =
      frameCount !== 0
        ? displacement - (sine((frameCount - 1) / durationCounter) - sine(0)) * (36 * durationCounter)
        : displacement;

    draw(ctx, images, step, displacement, positionValues);

    animationFrameId = requestAnimationFrame(() => {
      animate(ctx, frameCount + 1, images, durationCounter, positionValues);
    });
  };

  useEffect(() => {
    const canvas = lineCanvasRef?.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    lineDraw(context);
  }, []);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    if (caseWinner == null) return;
    const context = canvas.getContext('2d');
    let frameCount = 0;

    ///////////

    const images = {};
    const atherisAwpImage = new Image();
    const brokenFangCaseImage = new Image();
    const imperialPlaidGlovesImage = new Image();
    const asiimovAkImage = new Image();
    const loreBayonetKnifeImage = new Image();
    const stonewashBayonetKnifeImage = new Image();
    const printstreamDeagleImage = new Image();
    const pulseFamasImage = new Image();
    const desolateSpaceM4a4Image = new Image();
    const thorNegevImage = new Image();

    atherisAwpImage.src = atherisAwp.src;
    brokenFangCaseImage.src = brokenFangCase.src;
    imperialPlaidGlovesImage.src = imperialPlaidGloves.src;
    asiimovAkImage.src = asiimovAk.src;
    loreBayonetKnifeImage.src = loreBayonetKnife.src;
    stonewashBayonetKnifeImage.src = stonewashBayonetKnife.src;
    printstreamDeagleImage.src = printstreamDeagle.src;
    pulseFamasImage.src = pulseFamas.src;
    desolateSpaceM4a4Image.src = desolateSpaceM4a4.src;
    thorNegevImage.src = thorNegev.src;

    images['atheris_awp'] = { image: atherisAwpImage, fillStyle: 'rgb(204, 255, 153)' };
    images['broken_fang_case'] = { image: brokenFangCaseImage, fillStyle: 'rgb(236, 217, 198)' };
    images['imperial_plaid_gloves'] = { image: imperialPlaidGlovesImage, fillStyle: 'rgb(230, 204, 255)' };
    images['asiimov_ak'] = { image: asiimovAkImage, fillStyle: 'rgb(204, 255, 153)' };
    images['lore_bayonet_knife'] = { image: loreBayonetKnifeImage, fillStyle: 'rgb(236, 217, 198)' };
    images['stonewash_bayonet_knife'] = { image: stonewashBayonetKnifeImage, fillStyle: 'rgb(230, 204, 255)' };
    images['printstream_deagle'] = { image: printstreamDeagleImage, fillStyle: 'rgb(204, 255, 153)' };
    images['pulse_famas'] = { image: pulseFamasImage, fillStyle: 'rgb(236, 217, 198)' };
    images['desolate_space_m4a4'] = { image: desolateSpaceM4a4Image, fillStyle: 'rgb(230, 204, 255)' };
    images['thor_negev'] = { image: thorNegevImage, fillStyle: 'rgb(204, 255, 153)' };

    const durationCounter = 500;
    const durationCounterOffset = Math.floor(Math.random() * 100) * (Math.round(Math.random()) ? -1 : 1);

    if (animationState == 1) {
      let totalAnimateRefreshes = durationCounter + durationCounterOffset;
      let totalPixelsMoved = (sine(1) - sine(0)) * (36 * totalAnimateRefreshes);
      let winnerPosition = Math.floor(totalPixelsMoved / imagePixelWidth) + 1;
      let maximumImageMoved = winnerPosition + 3; // maximum
      let positionValues = Array(maximumImageMoved).fill('broken_fang_case');

      // skinsRandomizer
      const weights = x => {
        if (x < 0.75) {
          return 'broken_fang_case';
        } else if (x >= 0.75 && x < 0.8) {
          return 'atheris_awp';
        } else if (x >= 0.8 && x < 0.82) {
          return 'imperial_plaid_gloves';
        } else if (x >= 0.82 && x < 0.84) {
          return 'asiimov_ak';
        } else if (x >= 0.84 && x < 0.86) {
          return 'lore_bayonet_knife';
        } else if (x >= 0.86 && x < 0.88) {
          return 'stonewash_bayonet_knife';
        } else if (x >= 0.88 && x < 0.9) {
          return 'printstream_deagle';
        } else if (x >= 0.9 && x < 0.92) {
          return 'pulse_famas';
        } else if (x >= 0.92 && x < 0.94) {
          return 'desolate_space_m4a4';
        } else if (x >= 0.94 && x < 1) {
          return 'thor_negev';
        }
      };
      positionValues = positionValues.map(() => {
        return weights(Math.random());
      });

      positionValues[winnerPosition] = caseWinner;

      console.log('You won: ', caseWinner);
      // make API call to get winner?

      animate(context, frameCount, images, totalAnimateRefreshes, positionValues);
    } else if (animationState == 0) {
      console.log('calling animationState for 0');
    }

    return () => {
      console.log('unmounting or state update');
      cancelAnimationFrame(animationFrameId);
    };
  }, [animationState]);

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <SlotWindow>
          <div
            id="reel1"
            // ref={yourRef}
            style={{
              width: `${viewWidth}px`,
              borderStyle: 'solid'
              // backgroundImage: `url(${bg.src})`,
              // backgroundSize: 'cover',
              // backgroundRepeat: 'repeat-y',
              // width: '100px',
              // ...reelStyle1
            }}
          >
            <canvas ref={canvasRef} width={imagePixelWidth * 2} height={288} style={{ position: 'absolute' }}></canvas>
            <canvas
              ref={lineCanvasRef}
              width={imagePixelWidth * 2}
              height={288}
              style={{ position: 'absolute' }}
            ></canvas>
          </div>
        </SlotWindow>
        <Box>
          <button
            onClick={() => {
              if (animationState == 1) {
                setAnimationState(0);
              }
              if (animationState == 0) {
                if (canvasRef == undefined || lineCanvasRef == undefined) {
                  return;
                }
                // reset states
                setNewCaseWinner('-');
                setPreviousAccountBalance(accountBalance - 500);

                // make network call
                fetch(BACKEND_SERVER_URL)
                  .then(response => response.json())
                  .then(json => {
                    console.log(json);
                    setCaseWinner(json['result']);
                    setAccountBalance(json['accountBalance']);
                    // setPreviousAccountBalance(accountBalance);
                    setAnimationState(1);
                  })
                  .catch(e => console.error(e));
              }
            }}
          >
            Spin
          </button>
        </Box>
      </div>
      <div>
        {previousAccountBalance ? <div>Previous balance: ${previousAccountBalance / 100}</div> : <></>}
        {caseWinner !== '-' || caseWinner != null ? <div>Case winnings: ${skinsToAmount[caseWinner]}</div> : <></>}

        <div>Account balance: ${newAccountBalance / 100}</div>
        <div>You won: {newCaseWinner}</div>
      </div>
    </div>
  );
}
