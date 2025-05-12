'use client';
import { unstable_noStore } from 'next/cache';

import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRef, useEffect, useState } from 'react';

import { cases, skins, blue, purple, pink, red, gold } from '@/public/data/revolution.js';

import case1 from '../../public/revolution/case/crate_community_32.png';

import blue1 from '../../public/revolution/blue/weapon_mag7_cu_mag7_insomnia_light.png';
import blue2 from '../../public/revolution/blue/weapon_mp5sd_cu_mp5sd_quick_liquidation_light.png';
import blue3 from '../../public/revolution/blue/weapon_mp9_cu_mp9_superlight_light.png';
import blue4 from '../../public/revolution/blue/weapon_scar20_gs_scar_fragments_black_light.png';
import blue5 from '../../public/revolution/blue/weapon_sg556_cu_sg553_cyberforce_light.png';
import blue6 from '../../public/revolution/blue/weapon_tec9_cu_tec9_freedom_light.png';

import purple1 from '../../public/revolution/purple/weapon_glock_cu_glock_moon_rabbit_light.png';
import purple2 from '../../public/revolution/purple/weapon_m4a1_silencer_cu_m4a1s_feeding_frenzy_light.png';
import purple3 from '../../public/revolution/purple/weapon_mac10_cu_mac10_sakkaku_light.png';
import purple4 from '../../public/revolution/purple/weapon_p90_gs_p90_neoqueen_light.png';
import purple5 from '../../public/revolution/purple/weapon_revolver_gs_r8_banana_light.png';

import pink1 from '../../public/revolution/pink/weapon_awp_gs_awp_limbo_snake_light.png';
import pink2 from '../../public/revolution/pink/weapon_hkp2000_cu_p2000_decline_light.png';
import pink3 from '../../public/revolution/pink/weapon_ump45_cu_ump_clutch_kick_light.png';

import red1 from '../../public/revolution/red/weapon_ak47_cu_ak_head_shot_holo_light.png';
import red2 from '../../public/revolution/red/weapon_m4a1_cu_m4a4_temukau_light.png';

import gold1 from '../../public/revolution/gold/imperial_plaid_gloves.png';
import gold2 from '../../public/revolution/gold/lore_bayonet_knife.png';
import gold3 from '../../public/revolution/gold/stonewash_bayonet_knife.png';

const skin = {
  'MAG-7 Insomnia': { imageSrc: blue1 },
  'MP5-SD Quick Liquidation': { imageSrc: blue2 },
  'MP9 Superlight': { imageSrc: blue3 },
  'SCAR-20 Fragments': { imageSrc: blue4 },
  'SG553 Cyberforce': { imageSrc: blue5 },
  'Tec-9 Freedom': { imageSrc: blue6 },
  'Glock Moon Rabbit': { imageSrc: purple1 },
  'M4A1-S Feeding Frenzy': { imageSrc: purple2 },
  'MAC-10 Sakkaku': { imageSrc: purple3 },
  'P90 Neoqueen': { imageSrc: purple4 },
  'R8 Banana': { imageSrc: purple5 },
  'AWP Limbo Snake': { imageSrc: pink1 },
  'P2000 Decline': { imageSrc: pink2 },
  'UMP Clutch Kick': { imageSrc: pink3 },
  'AK-47 Head Shot': { imageSrc: red1 },
  'M4A4 Temukau': { imageSrc: red2 },
  'Imperial Plaid Gloves': { imageSrc: gold1 },
  'Lore Bayonet Knife': { imageSrc: gold2 },
  'Stonewash Bayonet Knife': { imageSrc: gold3 }
};
const BACKEND_SERVER_URL = process.env.NEXT_PUBLIC_CASES_API_SERVER_URL || 'http://localhost:3000/api/cases';

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

export default function Cases({ userBalance }) {
  unstable_noStore();

  const canvasRef = useRef(null);
  const lineCanvasRef = useRef(null);

  const [animationState, setAnimationState] = useState(0);

  const [caseWinner, setCaseWinner] = useState(null);
  console.log('starting user balance', userBalance);
  const [accountBalance, setAccountBalance] = useState(userBalance);
  const [globalAccountBalance, setGlobalAccountBalance] = useState(userBalance);
  const [newCaseWinner, setNewCaseWinner] = useState(null);
  const [isBlinking, setIsBlinking] = useState(0);

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
      } else if (image2Position < -imagePixelWidth) {
        let diff = -imagePixelWidth - image2Position;
        image2Position = 768 - diff;
        image2DisplayImage = image2DisplayImage + 3;
      } else if (image3Position < -imagePixelWidth) {
        let diff = -imagePixelWidth - image3Position;
        image3Position = 768 - diff;
        image3DisplayImage = image3DisplayImage + 3;
      }
    } else {
      if (image1Position > viewWidth) {
        let diff = image1Position - viewWidth;
        image1Position = -imagePixelWidth + diff;
        image1DisplayImage = image1DisplayImage - 3;
      } else if (image2Position > viewWidth) {
        let diff = image2Position - viewWidth;
        image2Position = -imagePixelWidth + diff;
        image2DisplayImage = image2DisplayImage - 3;
      } else if (image3Position > viewWidth) {
        let diff = image3Position - viewWidth;
        image3Position = -imagePixelWidth + diff;
        image3DisplayImage = image3DisplayImage - 3;
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
      //   setNewAccountBalance(accountBalance);
      setGlobalAccountBalance(accountBalance);
      setNewCaseWinner(caseWinner);
      console.log('spinsHistory', spinsHistory);

      // Dont love modifying an object
      //   .slice(-1)[0]
      spinsHistory[spinsHistory.length - 1]['currentBalance'] = accountBalance;
      spinsHistory[spinsHistory.length - 1]['winnings'] = skinsToAmount[caseWinner] * 100;
      spinsHistory[spinsHistory.length - 1]['skin'] = caseWinner;

      setSpinsHistory(spinsHistory);

      setIsBlinking(0);
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

  // setting up specific case on load
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    if (caseWinner == null) return;
    const context = canvas.getContext('2d');
    let frameCount = 0;

    //////////////////////

    let images = {};

    blue.forEach((blueSkin, index) => {
      const blueImage = new Image();
      blueImage.src = skinImages[blueSkin.name].src;
      images[blueSkin.name] = { image: blueImage, fillStyle: 'rgb(77, 121, 255)' };
    });
    purple.forEach((purple, index) => {
      const purpleImage = new Image();
      purpleImage.src = purple.image.src;
      images[purple.name] = { image: purpleImage, fillStyle: 'rgb(213, 128, 255)' };
    });
    pink.forEach((pink, index) => {
      const pinkImage = new Image();
      pinkImage.src = pink.image.src;
      images[pink.name] = { image: pinkImage, fillStyle: 'rgb(255, 77, 255)' };
    });
    red.forEach((red, index) => {
      const redImage = new Image();
      redImage.src = red.image.src;
      images[red.name] = { image: redImage, fillStyle: 'rgb(255, 51, 51)' };
    });
    gold.forEach((gold, index) => {
      const goldImage = new Image();
      goldImage.src = gold.image.src;
      images[gold.name] = { image: goldImage, fillStyle: 'rgb(255, 209, 26)' };
    });

    const caseImage = new Image();
    caseImage.src = case1.src;

    images['case_revolution'] = { image: caseImage, fillStyle: 'rgb(236, 217, 198)' };

    ////////////////////////

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

  console.log(spinsHistory);

  return (
    <div>
      <style jsx>
        {`
          @keyframes blink {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>
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

                setGlobalAccountBalance(accountBalance - 500);

                setIsBlinking(1);

                spinsHistory.push({
                  previousBalance: accountBalance,
                  currentBalance: null,
                  spinCost: 500, // dollars
                  winnings: null, // cents
                  skin: null
                });
                setSpinsHistory(spinsHistory);

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
            Open case!
          </button>
          <p>Cost per key: $2.50</p>
        </Box>
      </div>
      <div>
        {globalAccountBalance ? (
          <div>
            Account balance:{' '}
            <span style={isBlinking ? { opacity: 1, animation: 'blink 1s ease-in-out infinite' } : { opacity: 1 }}>
              ${globalAccountBalance / 100}
            </span>
          </div>
        ) : (
          <></>
        )}
        <hr></hr>
        {spinsHistory
          .slice()
          .reverse()
          .map((spin, idx) => (
            <div>
              <div>Previous balance: ${spin['previousBalance'] / 100}</div>
              <div>Spin cost: ${spin['spinCost'] / 100}</div>

              <div>
                Winnings:{' '}
                <span
                  style={
                    isBlinking && idx == 0 ? { opacity: 1, animation: 'blink 1s ease-in-out infinite' } : { opacity: 1 }
                  }
                >
                  ${spin['winnings'] ? spin['winnings'] / 100 : 'pending'}
                </span>
              </div>
              <div>
                Diff:{' '}
                {spin['winnings'] && spin['spinCost']
                  ? spin['winnings'] - spin['spinCost'] < 0
                    ? `-\$${Math.abs((spin['winnings'] - spin['spinCost']) / 100)}`
                    : `\$${(spin['winnings'] - spin['spinCost']) / 100}`
                  : null}
              </div>
              <div>
                New account balance:{' '}
                <span
                  style={
                    isBlinking && idx == 0 ? { opacity: 1, animation: 'blink 1s ease-in-out infinite' } : { opacity: 1 }
                  }
                >
                  ${spin['currentBalance'] / 100}
                </span>
              </div>
              <div>
                You won:{' '}
                <span
                  style={
                    isBlinking && idx == 0 ? { opacity: 1, animation: 'blink 1s ease-in-out infinite' } : { opacity: 1 }
                  }
                >
                  {spin['skin'] ? spin['skin'] : 'pending'}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
