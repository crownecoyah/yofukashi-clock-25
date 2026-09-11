import SwiftUI

struct DigitalClockView: View {
    @EnvironmentObject private var fontSettings: DigitalClockFontSettings
    let date: Date
    let boundaryHour: Int
    let showsSeconds: Bool

    var body: some View {
        let logical = try? LogicalDateTimeConverter().logicalDateTime(from: date, boundaryHour: boundaryHour)
        VStack(spacing: 4) {
            Text(dateText(logical))
                .font(fontSettings.font)
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.01)
                .frame(maxWidth: .infinity)
            Text(timeText(logical))
                .font(fontSettings.font)
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.01)
                .frame(maxWidth: .infinity)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("生活日時 \(dateText(logical)) \(timeText(logical))")
    }

    func dateText(_ value: LogicalDateTime?) -> String {
        guard let value else { return "----年--月--日" }
        return String(format: "%04d年%02d月%02d日", value.logicalDate.year, value.logicalDate.month, value.logicalDate.day)
    }

    func timeText(_ value: LogicalDateTime?) -> String {
        guard let value else { return "--:--" }
        if showsSeconds { return String(format: "%02d:%02d:%02d", value.hour, value.minute, value.second) }
        return String(format: "%02d:%02d", value.hour, value.minute)
    }
}
