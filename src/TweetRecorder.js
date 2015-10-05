#! /usr/bin/env node
import Twitter from 'twitter';
import keys from '../keys.json';
import minimist from 'minimist';
import fs from 'fs-plus';
import path from 'path';

const client = new Twitter(keys);
const argv = minimist(process.argv.slice(2));

if (argv._.length === 0) {
  console.error('Usage: TweetRecorder <track> [--out-file <filen-ame>]');
  process.exit();
}

const track = argv._[0];
const outputFilename = argv['out-file'] || argv.o || 'tweets.json';
const output = path.join(process.cwd(), outputFilename);

const showTweet = (tweet) => {
  console.log(tweet.text);
};

const getTweets = (filename) => {
  if (fs.existsSync(filename)) {
    return JSON.parse(fs.readFileSync(filename));
  }
  fs.writeFileSync(output, '[]');
  return [];
};

const putTweets = (tweets) => {
  fs.writeFileSync(output, JSON.stringify(tweets));
};


client.stream('statuses/filter', {track}, (stream) => {
  let tweetData = getTweets(output);
  stream.on('data', (tweet) => {
    tweetData.push(tweet);
    console.log(tweet.text);
    putTweets(tweetData);
  });

  stream.on('error', (err) => {
    throw err;
  });
});
