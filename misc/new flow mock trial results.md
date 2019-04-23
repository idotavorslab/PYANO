# Tempo = 75% (3/4)
## Truth 100%

| i   | Time | T.Delta | (T.Delta)/Tempo |
|-----|------|---------|-----------------|
| `0` | 0    | `null`  | `null`          |
| `1` | 2    | 2       | 2.66666         |
| `2` | 4    | 2       | 2.66666         |
| `3` | 5    | 1       | 1.33333         |


## Subject 120%     BAD: TOO FAST

| i   | Time  | T.Delta | Tempo*(T.Delta) |
|-----|-------|---------|-----------------|
| `0` | 0     | `null`  | `null`          |
| `1` | 1.666 | 1.666   | 1.25            |
| `2` | 3.333 | 1.666   | 1.25            |
| `3` | 4.166 | 0.833   | 0.625           |
    if T.Delta < Truth T.Delta: TOO FAST

## Subject 100%     GOOD

| i   | Time | T.Delta | Tempo*(T.Delta) |
|-----|------|---------|-----------------|
| `0` | 0    | `null`  | `null`          |
| `1` | 2    | 2       | 1.5             |
| `2` | 4    | 2       | 1.5             |
| `3` | 5    | 1       | 0.75            |

## Subject 80%     GOOD

| i   | Time | T.Delta | Tempo*(T.Delta) |
|-----|------|---------|-----------------|
| `0` | 0    | `null`  | `null`          |
| `1` | 2.5  | 2.5     | 1.875           |
| `2` | 5    | 2.5     | 1.875           |
| `3` | 6.25 | 1.25    | 0.9375          |
    if T.Delta > Truth T.Delta:
        if Tempo*(T.Delta) < T.Delta: GOOD
        else: BAD

## Subject 60%     BAD: TOO SLOW

| i   | Time  | T.Delta | Tempo*(T.Delta) |
|-----|-------|---------|-----------------|
| `0` | 0     | `null`  | `null`          |
| `1` | 3.333 | 3.333   | 2.5             |
| `2` | 6.666 | 3.333   | 2.5             |
| `3` | 8.333 | 1.666   | 1.25            |

    if T.Delta > Truth T.Delta:
        if Tempo*(T.Delta) < T.Delta: GOOD
        else: BAD




