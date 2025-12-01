import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class SwapEvent {
    constructor(props?: Partial<SwapEvent>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    txHash!: string

    @Index_()
    @IntColumn_({nullable: false})
    blockNumber!: number

    @IntColumn_({nullable: false})
    logIndex!: number

    @Index_()
    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @Index_()
    @StringColumn_({nullable: false})
    sender!: string

    @Index_()
    @StringColumn_({nullable: false})
    to!: string

    @BigIntColumn_({nullable: false})
    amount0In!: bigint

    @BigIntColumn_({nullable: false})
    amount1In!: bigint

    @BigIntColumn_({nullable: false})
    amount0Out!: bigint

    @BigIntColumn_({nullable: false})
    amount1Out!: bigint
}
