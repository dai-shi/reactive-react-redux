# Change Log

## [Unreleased]

## [4.3.0] - 2019-10-09
### Added
- A new API trackMemo to mark objects as used in React.memo

## [4.2.1] - 2019-10-05
### Changed
- Inline useForceUpdate to remove unnecessary deps

## [4.2.0] - 2019-07-27
### Removed
- Remove the experimental useTrackedSelectors hook

## [4.1.0] - 2019-07-20
### Changed
- No useLayoutEffect for invoking listeners (which leads de-opt sync mode)
  - Ref: https://github.com/dai-shi/reactive-react-redux/pull/31

## [4.0.0] - 2019-06-22
### Changed
- Direct state context
- Support custom context
- Rename hooks to be somewhat compatible with react-redux hooks

## [3.0.0] - 2019-05-18
### Changed
- New deep proxy instead of proxyequal
  - There is no breaking change in API, but it may behave differently from the previous version.

## [2.0.1] - 2019-04-15
### Changed
- Rename src file names to be more consistent

## [2.0.0] - 2019-04-13
### Removed
- Remove experimental useReduxStateMapped
### Changed
- useLayoutEffect and keep latest state after update (see #20)
- useForceUpdate uses counter instead of boolean (see #20)
- Organize code in multiple files with some improvements
- Update dependencies
### Added
- New useReduxSelectors (experimental)

## [1.8.0] - 2019-04-02
### Changed
- Improve useReduxStateMapped with proxyequal

## [1.7.0] - 2019-04-01
### Added
- Implement useReduxStateMapped (experimental/unstable/undocumented)
### Changed
- Rename project
  - Old "react-hooks-easy-redux"
  - New "reactive-react-redux"

## [1.6.0] - 2019-03-25
### Changed
- Memoize patched store with batchedUpdates

## [1.5.0] - 2019-03-25
### Changed
- No running callback in every commit phase (reverting #5)

## [1.4.0] - 2019-03-25
### Changed
- Avoid recalculating collectValuables for optimization
- Use unstable_batchedUpdates for optimization
  - This is not a breaking change as it has a fallback
  - Not tested with react-native (help wanted)

## [1.3.0] - 2019-03-03
### Changed
- Better handling stale props issue

## [1.2.0] - 2019-02-25
### Changed
- Cache proxy state for more performance

## [1.1.0] - 2019-02-17
### Changed
- Improve useRef usage for concurrent mode

## [1.0.0] - 2019-02-09
### Changed
- Improve initialization for concurrent mode
- Updated dependencies (React 16.8)

## [0.10.0] - 2019-01-29
### Changed
- Do not use useMemo as a semantic guarantee

## [0.9.0] - 2019-01-10
### Added
- useReduxStateSimple for shallow object comparison

## [0.8.0] - 2018-12-24
### Changed
- No spread guards in proxyequal for better compatibility

## [0.7.0] - 2018-12-19
### Added
- Better warning message for no ReduxProvider
### Changed
- Refactor to support dynamic updating

## [0.6.0] - 2018-12-17
### Changed
- Support changing store

## [0.5.0] - 2018-12-13
### Changed
- Fix types and examples for the previous change

## [0.4.0] - 2018-12-13
### Changed
- Gave up bailOutHack and use subscriptions

## [0.3.0] - 2018-11-20
### Changed
- bailOutHack with ErrorBoundary

## [0.2.0] - 2018-11-17
### Added
- Use proxyequal for deep change detection

## [0.1.0] - 2018-11-15
### Added
- Initial experimental release
