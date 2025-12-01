import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class SyncEvent {
    constructor(props?: Partial<SyncEvent>) {
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

    @BigIntColumn_({nullable: false})
    reserve0!: bigint

    @BigIntColumn_({nullable: false})
    reserve1!: bigint
}
