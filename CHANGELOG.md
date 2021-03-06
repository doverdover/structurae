# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2019-11-21
### Removed
Deprecated classes and methods:
- Remove RecordArray (consider using ObjectView instead)
- Remove StringArrayView (use ArrayView instead)
- Remove `toObject` methods of *View classes (use `toJSON` methods instead)

### Changed
- Rename `BitField.fields` to `BitField.schema`, simplify the schema definition
- BitField no longer implicitly switches to using BigInts
- Add BigBitField that uses BigInts for bitfields longer than 31 bits.
- BitFieldMixin automatically switches to BigBitField if the size of the bitfield exceeds 31 bits.
- BitField no longer auto-initializes upon first call,
use `BitField.initialize()` or BitFieldMixin to initialize the class after creation.

## [1.8.0] - 2019-09-27
### Added
- Support default field values in ObjectView

### Changed
- (potentially breaking) `ObjectView.from` no longer initializes ObjectView upon the first call.
Call `ObjectView.intialize()` upon setting the schema (`ObjectView.schema`) for the extending class, or use ObjectViewMixin

## [1.7.5] - 2019-09-22
### Added
- Add BitFieldMixin

### Fixed
- Avoid BigInts in RecordArray if not supported

## [1.7.4] - 2019-09-21
### Added
- Add ObjectViewMixin and expose ArrayView
- Add ObjectView#getView

## [1.7.3] - 2019-09-13
### Fixed
- Handle non-string values in StringView.from

## [1.7.2] - 2019-09-13
### Added
- Add StringView.from that uses TextEncoder#encodeInto

### Changed
- Support strings in ArrayView replacing StringArrayView

## [1.7.1] - 2019-09-11
### Added
- Support custom types in nested ObjectViews

## [1.7.0] - 2019-09-09
### Added
- Support custom types in ObjectView
- Add getValue methods to View classes
- Add toJSON methods and deprecate toObject in View classes 

## [1.6.1] - 2019-08-20
### Fixed
- Add iterators in TypeScript definitions

## [1.6.0] - 2019-08-17
### Added
- Add CollectionView

## [1.5.0] - 2019-06-28
### Added
- Add StringArrayView class to support arrays of strings in ObjectView

## [1.4.0] - 2019-06-20
### Added
- Support setting endiannes for TypedArrayViews
- Make TypedArrayViews public

## [1.3.1] - 2019-06-19
### Added
- ArrayView.of & TypedArrayView.of methods

### Changed
- Reworked ObjectView and ArrayView for better performance

## [1.3.0] - 2019-06-15
### Added
- ObjectView, ArrayView, and TypedArrayView classes

## [1.2.1] - 2019-06-10
### Fix
- Correct byte offsets for strings in RecordArray

## [1.2.0] - 2019-06-10
### Added
- Support TypedArray fields in RecordArray

## [1.1.1] - 2019-06-09
### Added
- RecordArray#fromObject

## [1.1.0] - 2019-06-07
### Added
- BitArray
- RankedBitArray

### Changed
- Pool extends BitArray

## [1.0.1] - 2019-06-04
### Fixed
- Set correct size for Pool.