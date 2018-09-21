const ITER = 1E9

function unoTestFunction(a) {
  if (typeof a === 'string') a = parseInt(a)
  return 1 + a
}

let sum = 0
for (let i = 0; i < ITER; i++) {
  sum += unoTestFunction(i)
  if (sum > 1E22) sum = 0
}

for (let i = 0; i < ITER; i++) {
  sum += unoTestFunction('' + i)
  if (sum > 1E22) sum = 0
}

print(sum)
