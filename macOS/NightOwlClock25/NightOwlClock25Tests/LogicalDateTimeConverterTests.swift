import XCTest
@testable import NightOwlClock25

final class LogicalDateTimeConverterTests: XCTestCase {
    private var calendar: Calendar!
    private var converter: LogicalDateTimeConverter!

    override func setUp() {
        calendar = Calendar(identifier: .gregorian)
        calendar.locale = Locale(identifier: "en_US_POSIX")
        calendar.timeZone = TimeZone(identifier: "Asia/Tokyo")!
        converter = LogicalDateTimeConverter(calendar: calendar)
    }

    func testActualToLogicalAroundFiveOClockBoundary() throws {
        try assertActual(2027, 7, 8, 0, 0, becomes: 2027, 7, 7, 24, 0)
        try assertActual(2027, 7, 8, 1, 25, becomes: 2027, 7, 7, 25, 25)
        try assertActual(2027, 7, 8, 4, 59, becomes: 2027, 7, 7, 28, 59)
        try assertActual(2027, 7, 8, 5, 0, becomes: 2027, 7, 8, 5, 0)
    }

    func testLogicalToActualExtendedHours() throws {
        try assertLogical(2027, 1, 1, 25, 0, becomes: 2027, 1, 2, 1, 0)
        try assertLogical(2027, 1, 1, 28, 0, becomes: 2027, 1, 2, 4, 0)
    }

    func testMonthLeapAndYearTransitions() throws {
        try assertLogical(2027, 1, 31, 25, 0, becomes: 2027, 2, 1, 1, 0)
        try assertLogical(2027, 2, 28, 25, 0, becomes: 2027, 3, 1, 1, 0)
        try assertLogical(2028, 2, 29, 25, 0, becomes: 2028, 3, 1, 1, 0)
        try assertLogical(2027, 12, 31, 25, 0, becomes: 2028, 1, 1, 1, 0)
    }

    func testDifferentTimeZone() throws {
        calendar.timeZone = TimeZone(identifier: "America/New_York")!
        converter = LogicalDateTimeConverter(calendar: calendar)
        try assertActual(2027, 7, 8, 2, 30, becomes: 2027, 7, 7, 26, 30)
        try assertLogical(2027, 7, 7, 26, 30, becomes: 2027, 7, 8, 2, 30)
    }

    func testRejectsInvalidCivilDate() throws {
        let logical = try LogicalDateTime(logicalDate: .init(year: 2027, month: 2, day: 30), hour: 25, minute: 0)
        XCTAssertThrowsError(try converter.actualDate(from: logical))
    }

    private func assertActual(_ year: Int, _ month: Int, _ day: Int, _ hour: Int, _ minute: Int,
                              becomes logicalYear: Int, _ logicalMonth: Int, _ logicalDay: Int,
                              _ logicalHour: Int, _ logicalMinute: Int) throws {
        let actual = calendar.date(from: DateComponents(year: year, month: month, day: day, hour: hour, minute: minute, second: 0))!
        let value = try converter.logicalDateTime(from: actual, boundaryHour: 5)
        XCTAssertEqual(value, try LogicalDateTime(logicalDate: .init(year: logicalYear, month: logicalMonth, day: logicalDay), hour: logicalHour, minute: logicalMinute))
    }

    private func assertLogical(_ year: Int, _ month: Int, _ day: Int, _ hour: Int, _ minute: Int,
                               becomes actualYear: Int, _ actualMonth: Int, _ actualDay: Int,
                               _ actualHour: Int, _ actualMinute: Int) throws {
        let logical = try LogicalDateTime(logicalDate: .init(year: year, month: month, day: day), hour: hour, minute: minute)
        let actual = try converter.actualDate(from: logical)
        let expected = calendar.date(from: DateComponents(year: actualYear, month: actualMonth, day: actualDay, hour: actualHour, minute: actualMinute, second: 0))!
        XCTAssertEqual(actual, expected)
    }
}
