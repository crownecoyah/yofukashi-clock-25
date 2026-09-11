import SwiftUI

struct AnalogClockStyle {
    var faceColor: Color = Color(nsColor: .controlBackgroundColor)
    var markColor: Color = .primary
    var hourHandColor: Color = .primary
    var minuteHandColor: Color = .primary
    var secondHandColor: Color = .red
    var showsNumbers = true
}

struct AnalogClockView: View {
    let date: Date
    let showsSeconds: Bool
    var style = AnalogClockStyle()
    private var calendar: Calendar { .autoupdatingCurrent }

    var body: some View {
        GeometryReader { proxy in
            let size = min(proxy.size.width, proxy.size.height)
            let center = CGPoint(x: proxy.size.width / 2, y: proxy.size.height / 2)
            let radius = size / 2
            Canvas { context, _ in
                context.fill(Path(ellipseIn: CGRect(x: center.x - radius, y: center.y - radius, width: size, height: size)), with: .color(style.faceColor))
                context.stroke(Path(ellipseIn: CGRect(x: center.x - radius + 1, y: center.y - radius + 1, width: size - 2, height: size - 2)), with: .color(style.markColor.opacity(0.35)), lineWidth: 2)
                drawMarks(context: context, center: center, radius: radius)
                if style.showsNumbers { drawNumbers(context: context, center: center, radius: radius) }

                let parts = calendar.dateComponents([.hour, .minute, .second, .nanosecond], from: date)
                let second = Double(parts.second ?? 0) + Double(parts.nanosecond ?? 0) / 1_000_000_000
                let minute = Double(parts.minute ?? 0) + second / 60
                let hour = Double((parts.hour ?? 0) % 12) + minute / 60
                drawHand(context: context, center: center, radius: radius * 0.50, angle: hour / 12 * 360, width: max(4, size * 0.025), color: style.hourHandColor)
                drawHand(context: context, center: center, radius: radius * 0.72, angle: minute / 60 * 360, width: max(2.5, size * 0.016), color: style.minuteHandColor)
                if showsSeconds { drawHand(context: context, center: center, radius: radius * 0.80, angle: second / 60 * 360, width: max(1, size * 0.006), color: style.secondHandColor) }
                context.fill(Path(ellipseIn: CGRect(x: center.x - 4, y: center.y - 4, width: 8, height: 8)), with: .color(style.hourHandColor))
            }
        }
        .aspectRatio(1, contentMode: .fit)
        .accessibilityLabel("アナログ時計")
    }

    private func point(center: CGPoint, radius: CGFloat, degrees: Double) -> CGPoint {
        let radians = (degrees - 90) * .pi / 180
        return CGPoint(x: center.x + radius * cos(radians), y: center.y + radius * sin(radians))
    }

    private func drawMarks(context: GraphicsContext, center: CGPoint, radius: CGFloat) {
        for index in 0..<60 {
            var path = Path()
            path.move(to: point(center: center, radius: radius * (index.isMultiple(of: 5) ? 0.86 : 0.90), degrees: Double(index) * 6))
            path.addLine(to: point(center: center, radius: radius * 0.95, degrees: Double(index) * 6))
            context.stroke(path, with: .color(style.markColor.opacity(index.isMultiple(of: 5) ? 0.8 : 0.35)), lineWidth: index.isMultiple(of: 5) ? 2 : 1)
        }
    }

    private func drawNumbers(context: GraphicsContext, center: CGPoint, radius: CGFloat) {
        for number in 1...12 {
            let position = point(center: center, radius: radius * 0.73, degrees: Double(number) * 30)
            context.draw(Text("\(number)").font(.system(size: radius * 0.105, weight: .medium, design: .rounded)).foregroundStyle(style.markColor), at: position)
        }
    }

    private func drawHand(context: GraphicsContext, center: CGPoint, radius: CGFloat, angle: Double, width: CGFloat, color: Color) {
        var path = Path()
        path.move(to: point(center: center, radius: -radius * 0.12, degrees: angle))
        path.addLine(to: point(center: center, radius: radius, degrees: angle))
        context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round))
    }
}
