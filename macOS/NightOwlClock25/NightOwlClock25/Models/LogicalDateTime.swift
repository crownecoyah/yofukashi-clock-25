import Foundation

struct LogicalDate: Codable, Equatable, Hashable, Sendable {
    let year: Int
    let month: Int
    let day: Int
}

struct LogicalDateTime: Codable, Equatable, Hashable, Sendable {
    static let allowedHourRange = 0...35

    let logicalDate: LogicalDate
    let hour: Int
    let minute: Int
    let second: Int

    init(logicalDate: LogicalDate, hour: Int, minute: Int, second: Int = 0) throws {
        guard Self.allowedHourRange.contains(hour) else { throw ValidationError.invalidHour }
        guard (0...59).contains(minute) else { throw ValidationError.invalidMinute }
        guard (0...59).contains(second) else { throw ValidationError.invalidSecond }
        self.logicalDate = logicalDate
        self.hour = hour
        self.minute = minute
        self.second = second
    }

    enum ValidationError: LocalizedError {
        case invalidHour, invalidMinute, invalidSecond

        var errorDescription: String? {
            switch self {
            case .invalidHour: "時は0〜35の範囲で指定してください。"
            case .invalidMinute: "分は0〜59の範囲で指定してください。"
            case .invalidSecond: "秒は0〜59の範囲で指定してください。"
            }
        }
    }
}
