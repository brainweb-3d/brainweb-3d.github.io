// Build fix for three's meshopt_decoder: it builds its Web Worker from `decode.toString() + workerProcess.toString()`
// plus a string that names `workerProcess`, `instance` and `ready`. The production minifier renames those functions and
// variables, so in the built site the worker crashed ("workerProcess is not defined") and the brain model never
// finished loading. This plugin swaps the toString() calls for the functions' original source text, so the worker
// code is the same in dev and build, whatever the minifier does to the main-thread copy.
const FILE = /meshopt_decoder\.module\.js$/;
const CALL = 'decode.toString() + workerProcess.toString()';

function fnSource(code, name) {
  const start = code.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`meshopt fix: function ${name} not found`);
  let depth = 0;
  for (let i = code.indexOf('{', start); i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}' && --depth === 0) return code.slice(start, i + 1);
  }
  throw new Error(`meshopt fix: function ${name} not closed`);
}

export default function meshoptWorkerFix() {
  return {
    name: 'meshopt-worker-fix',
    apply: 'build',
    transform(code, id) {
      if (!FILE.test(id.split('?')[0])) return null;
      if (!code.includes(CALL)) throw new Error('meshopt fix: three changed the decoder; check the worker still builds');
      const text = `${fnSource(code, 'decode')}\n${fnSource(code, 'workerProcess')}`;
      return { code: code.replace(CALL, JSON.stringify(text)), map: null };
    },
  };
}
