# Notes

## V8 code sections

### Code Events

- [code-events.h](https://cs.chromium.org/chromium/src/v8/src/code-events.h?q=code-creation&sq=package:chromium&g=0&l=28)
  - mainly interesting:
    - 'code-creation': `CODE_CREATION_EVENT`
    - 'code-move': `CODE_MOVE_EVENT`
    - 'code-delete': `CODE_DELETE_EVENT`
    - 'sfi-move': `SHARED_FUNC_MOVE_EVENT`
- all go through the `CODE_EVENT_DISPATCH(code)` defined in `code-events.h`
- `CodeEventDispatcher` (`code-events.h`) allows adding listeners to code events
- `log.cc` `Logger::AddCodeEventListener(CodeEventListener* listener)` calls that method
- logger is initialized inside `isolate.cc` `Isolate::Init`, so for now we should init our
  `CodeEventListener` there as well

#### CODE-CREATION-EVENT

- handled via internal event callback [inside
  log.cc](https://cs.chromium.org/chromium/src/v8/src/log.cc?q=CODE_CREATION_EVENT&sq=package:chromium&g=0&l=1176)
- called via `LOG_CODE_EVENT` macro defined in `log.h`
- `LOG_CODE_EVENT` is invoked from 
  - `code-generator.cc`
  - `liveedit.cc`
  - `heap-inl.h`
  - `bytecode-array-writer.cc`
  - `builtin-serializer.cc`
  - `startup-serializer.cc`
  - `wasm-code-manager.cc`

#### CODE-MOVE-EVENT

- handled via `CodeMoveEvent` [inside
  log.cc](https://cs.chromium.org/chromium/src/v8/src/log.cc?q=CODE_MOVE_EVENT&sq=package:chromium&g=0&l=1412)

### Jit Code Events

- [JitCodeEvent](https://cs.chromium.org/chromium/src/v8/include/v8.h?q=JitCodeEvent&sq=package:chromium&g=0&l=6779)
```
CODE_ADDED,
CODE_MOVED,
CODE_REMOVED,                   // removal events are not currently issued
CODE_ADD_LINE_POS_INFO,
CODE_START_LINE_INFO_RECORDING,
CODE_END_LINE_INFO_RECORDING
```

### JitLogger Events from Code Events

- the
  [JitLogger](https://cs.chromium.org/chromium/src/v8/src/log.cc?sq=package:chromium&g=0&l=627)
  listens to CodeEvents and emits `JitCodeEvent`s
- the relationship between properties can easily be seen here

#### CODE-ADDED

```cc
// JitLogger::LogRecordedBuffer(AbstractCode* code,
//                              SharedFunctionInfo* shared, const char* name,
//                              int length)

event.type       = JitCodeEvent::CODE_ADDED
event.code_start = code->InstructionStart()
event.code_type  = JitCodeEvent::JIT_CODE || JitCodeEvent::BYTE_CODE
event.code_len   = code->InstructionSize()
event.script     = shared_function_handle
event.name.str   = name
event.name.len   = length
```

#### CODE-MOVED

```cc
// JitLogger::CodeMoveEvent(AbstractCode* from, AbstractCode* to)

event.type           = JitCodeEvent::CODE_MOVED
event.code_start     = code->InstructionStart()
event.code_type      = JitCodeEvent::JIT_CODE || JitCodeEvent::BYTE_CODE
event.code_len       = from->InstructionSize()
event.new_code_start = to->InstructionStart()
```

#### CODE-ADD-LINE-POS-INFO

```cc
// JitLogger::AddCodeLinePosInfoEvent(
//     void* jit_handler_data,
//     int pc_offset,
//     int position,
//     JitCodeEvent::PositionType position_type)

event.type                    = JitCodeEvent::CODE_ADD_LINE_POS_INFO
event.user_data               = jit_handler_data
event.line_info.offset        = pc_offset
event.line_info.pos           = position
event.line_info.position_type = position_type
```

#### CODE-START-LINE-INFO-RECORDING

```cc
// JitLogger::StartCodePosInfoEvent()
event.type = JitCodeEvent::CODE_START_LINE_INFO_RECORDING
```

#### CODE-END-LINE-INFO-RECORDING

```cc
// JitLogger::EndCodePosInfoEvent(Address start_address,
//                                void* jit_handler_data)

event.type       = JitCodeEvent::CODE_END_LINE_INFO_RECORDING
event.code_start = start_address
event.user_data  = jit_handler_data
```
