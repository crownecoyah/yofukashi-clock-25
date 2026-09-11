import Foundation

struct LogicalDateTimeConverter: Sendable {
    enum ConversionError: LocalizedError {
        case invalidBoundaryHour
        case invalidLogicalDate
        case nonexistentLocalTime

        var errorDescription: String? {
            switch self {
            case .invalidBoundaryHour: "一日の境界は0〜12時で指定してください。"
            case .invalidLogicalDate: "有効な日付を指定してください。"
            case .nonexistentLocalTime: "指定された現地時刻は存在しません。"
            }
        }
    }

    let calendar: Calendar

    init(calendar: Calendar = .autoupdatingCurrent) {
        self.calendar = calendar
    }

    func actualDate(from logical: LogicalDateTime) throws -> Date {
        var baseComponents = DateComponents()
        baseComponents.calendar = calendar
        baseComponents.timeZone = calendar.timeZone
        baseComponents.year = logical.logicalDate.year
        baseComponents.month = logical.logicalDate.month
        baseComponents.day = logical.logicalDate.day
        baseComponents.hour = 12

        guard let midday = calendar.date(from: baseComponents),
              matchesDate(midday, logical.logicalDate) else {
            throw ConversionError.invalidLogicalDate
        }

        let dayOffset = logical.hour / 24
        guard let targetDay = calendar.date(byAdding: .day, value: dayOffset, to: calendar.startOfDay(for: midday)) else {
            throw ConversionError.invalidLogicalDate
        }

        var time = DateComponents()
        time.hour = logical.hour % 24
        time.minute = logical.minute
        time.second = logical.second
        guard let result = calendar.date(bySettingHour: time.hour!, minute: time.minute!, second: time.second!, of: targetDay),
              calendar.component(.hour, from: result) == time.hour,
              calendar.component(.minute, from: result) == time.minute else {
            throw ConversionError.nonexistentLocalTime
        }
        return result
    }

    func logicalDateTime(from actual: Date, boundaryHour: Int) throws -> LogicalDateTime {
        guard (0...12).contains(boundaryHour) else { throw ConversionError.invalidBoundaryHour }
        let components = calendar.dateComponents([.year, .month, .day, .hour, .minute, .second], from: actual)
        guard let year = components.year, let month = components.month, let day = components.day,
              let hour = components.hour, let minute = components.minute, let second = components.second else {
            throw ConversionError.invalidLogicalDate
        }

        if hour < boundaryHour {
            guard let previousDay = calendar.date(byAdding: .day, value: -1, to: calendar.startOfDay(for: actual)) else {
                throw ConversionError.invalidLogicalDate
            }
            let date = calendar.dateComponents([.year, .month, .day], from: previousDay)
            return try LogicalDateTime(
                logicalDate: LogicalDate(year: date.year!, month: date.month!, day: date.day!),
                hour: hour + 24,
                minute: minute,
                second: second
            )
        }
        return try LogicalDateTime(
            logicalDate: LogicalDate(year: year, month: month, day: day),
            hour: hour,
            minute: minute,
            second: second
        )
    }

    private func matchesDate(_ date: Date, _ logicalDate: LogicalDate) -> Bool {
        let values = calendar.dateComponents([.year, .month, .day], from: date)
        return values.year == logicalDate.year && values.month == logicalDate.month && values.day == logicalDate.day
    }
}
